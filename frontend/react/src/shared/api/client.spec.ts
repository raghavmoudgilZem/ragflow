import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AxiosHeaders } from 'axios';
import type {
  AxiosResponse,
  InternalAxiosRequestConfig,
  ResponseType,
} from 'axios';
import type { ApiResponse } from './envelope';

vi.mock('@shared/utils/authorization', () => ({
  AUTHORIZATION_HEADER: 'Authorization',
  getAuthorization: vi.fn(() => 'Bearer test-token'),
  removeAll: vi.fn(),
  redirectToLogin: vi.fn(),
}));

vi.mock('./notification', () => ({
  notifyError: vi.fn(),
  notifyMessageError: vi.fn(),
}));

vi.mock('./session', () => ({
  handleSessionExpired: vi.fn(),
}));

vi.mock('./refresh', () => ({
  refreshSession: vi.fn(),
}));

import apiClient, { get, post, drop, put } from './client';
import { getAuthorization } from '@shared/utils/authorization';
import { notifyError, notifyMessageError } from './notification';
import { refreshSession } from './refresh';
import { handleSessionExpired } from './session';

type RequestFulfilled = (
  config: InternalAxiosRequestConfig,
) => InternalAxiosRequestConfig;
type ResponseFulfilled = (response: AxiosResponse) => AxiosResponse;
type ResponseRejected = (error: unknown) => unknown;

const requestManager = apiClient.interceptors.request as unknown as {
  handlers: { fulfilled: RequestFulfilled }[];
};
const responseManager = apiClient.interceptors.response as unknown as {
  handlers: { fulfilled: ResponseFulfilled; rejected: ResponseRejected }[];
};

const runRequest = requestManager.handlers[0].fulfilled;
const runResponse = responseManager.handlers[0].fulfilled;
const runResponseError = responseManager.handlers[0].rejected;

const buildConfig = (
  overrides: Partial<InternalAxiosRequestConfig> = {},
): InternalAxiosRequestConfig =>
  ({ headers: new AxiosHeaders(), ...overrides }) as InternalAxiosRequestConfig;

const buildResponse = (
  data: ApiResponse<unknown>,
  status = 200,
  responseType?: ResponseType,
): AxiosResponse<ApiResponse<unknown>> =>
  ({
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: { headers: new AxiosHeaders(), responseType },
  }) as AxiosResponse<ApiResponse<unknown>>;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('apiClient instance', () => {
  it('uses the 300000ms timeout', () => {
    expect(apiClient.defaults.timeout).toBe(300000);
  });
});

describe('request interceptor', () => {
  it('snake_cases data and params and injects the auth header', () => {
    const config = runRequest(
      buildConfig({ data: { userName: 'ada' }, params: { pageSize: 10 } }),
    );
    expect(config.data).toEqual({ user_name: 'ada' });
    expect(config.params).toEqual({ page_size: 10 });
    expect(config.headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('skips token injection when skipToken is set', () => {
    const config = runRequest(buildConfig({ skipToken: true }));
    expect(getAuthorization).not.toHaveBeenCalled();
    expect(config.headers.get('Authorization')).toBeUndefined();
  });
});

describe('response interceptor', () => {
  it('returns blob responses untouched and skips envelope handling', () => {
    const response = buildResponse(
      { success: false, status_code: 400, errors: ['ignored'], data: null },
      200,
      'blob',
    );
    expect(runResponse(response)).toBe(response);
    expect(notifyMessageError).not.toHaveBeenCalled();
  });

  it('shows a message toast when a 2xx body reports success false', () => {
    runResponse(
      buildResponse({
        success: false,
        status_code: 400,
        errors: ['biz error'],
        data: null,
      }),
    );
    expect(notifyMessageError).toHaveBeenCalledWith('biz error');
  });

  it('delegates to handleSessionExpired when a 2xx body has status_code 401', () => {
    runResponse(
      buildResponse({
        success: false,
        status_code: 401,
        errors: ['unauthorized'],
        data: null,
      }),
    );
    expect(handleSessionExpired).toHaveBeenCalledTimes(1);
    expect(handleSessionExpired).toHaveBeenCalledWith('unauthorized');
    expect(notifyError).not.toHaveBeenCalled();
  });

  it('passes through a successful response without notifying', () => {
    const response = buildResponse({
      success: true,
      status_code: 200,
      errors: [],
      data: { id: 1 },
    });
    expect(runResponse(response)).toBe(response);
    expect(notifyError).not.toHaveBeenCalled();
    expect(notifyMessageError).not.toHaveBeenCalled();
  });
});

describe('response error handler', () => {
  it('notifies a network anomaly on Failed to fetch and rejects', async () => {
    await expect(
      runResponseError({ message: 'Failed to fetch' }) as Promise<unknown>,
    ).rejects.toBeDefined();
    expect(notifyError).toHaveBeenCalledTimes(1);
  });

  it('notifies a request error when a response status exists and rejects', async () => {
    await expect(
      runResponseError({
        message: 'Request failed',
        response: { status: 500, statusText: 'Server Error', config: { url: '/x' } },
      }) as Promise<unknown>,
    ).rejects.toBeDefined();
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(handleSessionExpired).not.toHaveBeenCalled();
  });

  it('shows the enveloped error message on a non-401 error response and rejects', async () => {
    await expect(
      runResponseError({
        message: 'Request failed',
        response: {
          status: 400,
          statusText: 'Bad Request',
          config: { url: '/x' },
          data: {
            success: false,
            status_code: 400,
            errors: ['name required', 'too long'],
            data: null,
          },
        },
      }) as Promise<unknown>,
    ).rejects.toBeDefined();
    expect(notifyMessageError).toHaveBeenCalledWith('name required, too long');
    expect(handleSessionExpired).not.toHaveBeenCalled();
  });

  it('delegates to handleSessionExpired on a 401 without a config and still rejects', async () => {
    await expect(
      runResponseError({
        message: 'Request failed',
        response: { status: 401, statusText: 'Unauthorized', config: { url: '/x' } },
      }) as Promise<unknown>,
    ).rejects.toBeDefined();
    expect(refreshSession).not.toHaveBeenCalled();
    expect(handleSessionExpired).toHaveBeenCalledTimes(1);
    expect(notifyError).not.toHaveBeenCalled();
  });
});

describe('silent refresh on 401', () => {
  it('refreshes the session and retries the original request once', async () => {
    vi.mocked(refreshSession).mockResolvedValue('fresh-token');
    const requestSpy = vi
      .spyOn(apiClient, 'request')
      .mockResolvedValue({ data: { success: true } } as AxiosResponse);
    const config = buildConfig({ url: '/x' });

    await runResponseError({
      message: 'Request failed',
      config,
      response: { status: 401, statusText: 'Unauthorized', config },
    });

    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(requestSpy).toHaveBeenCalledWith(config);
    expect(config.retried).toBe(true);
    expect(handleSessionExpired).not.toHaveBeenCalled();
  });

  it('expires the session when the refresh itself fails and rejects', async () => {
    vi.mocked(refreshSession).mockRejectedValue(new Error('refresh failed'));
    const config = buildConfig({ url: '/x' });

    await expect(
      runResponseError({
        message: 'Request failed',
        config,
        response: { status: 401, statusText: 'Unauthorized', config },
      }) as Promise<unknown>,
    ).rejects.toBeDefined();

    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(handleSessionExpired).toHaveBeenCalledTimes(1);
  });

  it('does not retry a request that was already retried', async () => {
    const config = buildConfig({ url: '/x', retried: true });

    await expect(
      runResponseError({
        message: 'Request failed',
        config,
        response: { status: 401, statusText: 'Unauthorized', config },
      }) as Promise<unknown>,
    ).rejects.toBeDefined();

    expect(refreshSession).not.toHaveBeenCalled();
    expect(handleSessionExpired).toHaveBeenCalledTimes(1);
  });

  it('skips refresh entirely when skipAuthRefresh is set', async () => {
    const config = buildConfig({ url: '/x', skipAuthRefresh: true });

    await expect(
      runResponseError({
        message: 'Request failed',
        config,
        response: { status: 401, statusText: 'Unauthorized', config },
      }) as Promise<unknown>,
    ).rejects.toBeDefined();

    expect(refreshSession).not.toHaveBeenCalled();
    expect(handleSessionExpired).toHaveBeenCalledTimes(1);
  });
});

describe('helper exports', () => {
  it('get delegates to apiClient.get', () => {
    const getSpy = vi
      .spyOn(apiClient, 'get')
      .mockResolvedValue({} as AxiosResponse);
    get('/datasets');
    expect(getSpy).toHaveBeenCalledWith('/datasets');
  });

  it('post nests the body under a data property', () => {
    const postSpy = vi
      .spyOn(apiClient, 'post')
      .mockResolvedValue({} as AxiosResponse);
    post('/datasets', { name: 'x' });
    expect(postSpy).toHaveBeenCalledWith('/datasets', { data: { name: 'x' } });
  });

  it('drop and put are no-ops', () => {
    expect(drop()).toBeUndefined();
    expect(put()).toBeUndefined();
  });
});
