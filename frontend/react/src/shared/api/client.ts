import axios from 'axios';
import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import i18n from '@shared/i18n';
import {
  AUTHORIZATION_HEADER,
  getAuthorization,
} from '@shared/utils/authorization';
import { convertKeysToSnakeCase, convertKeysToCamelCase } from '@shared/utils/case-convert';
import type { ApiResponse } from './envelope';
import { HttpStatus, getErrorMessage } from './envelope';
import { notifyError, notifyMessageError } from './notification';
import { refreshSession } from './refresh';
import { handleSessionExpired } from './session';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipToken?: boolean;
    skipAuthRefresh?: boolean;
    retried?: boolean;
  }
}

const REQUEST_TIMEOUT = 300000;
const FAILED_TO_FETCH = 'Failed to fetch';

export type RetcodeStatus =
  | 200
  | 201
  | 202
  | 204
  | 400
  | 401
  | 403
  | 404
  | 406
  | 410
  | 413
  | 422
  | 500
  | 502
  | 503
  | 504;

export const RetcodeMessage: Record<RetcodeStatus, string> = {
  200: i18n.t('message.200'),
  201: i18n.t('message.201'),
  202: i18n.t('message.202'),
  204: i18n.t('message.204'),
  400: i18n.t('message.400'),
  401: i18n.t('message.401'),
  403: i18n.t('message.403'),
  404: i18n.t('message.404'),
  406: i18n.t('message.406'),
  410: i18n.t('message.410'),
  413: i18n.t('message.413'),
  422: i18n.t('message.422'),
  500: i18n.t('message.500'),
  502: i18n.t('message.502'),
  503: i18n.t('message.503'),
  504: i18n.t('message.504'),
};

const errorHandler = (error: AxiosError): void => {
  const { response } = error;
  if (error.message === FAILED_TO_FETCH) {
    notifyError({
      message: i18n.t('message.networkAnomaly'),
      description: i18n.t('message.networkAnomalyDescription'),
    });
    return;
  }
  if (response && response.status) {
    const errorText =
      RetcodeMessage[response.status as RetcodeStatus] || response.statusText;
    notifyError({
      message: `${i18n.t('message.requestError')} ${response.status}: ${response.config?.url ?? ''}`,
      description: errorText,
    });
  }
};

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.data = convertKeysToSnakeCase(config.data);
    config.params = convertKeysToSnakeCase(config.params);
    if (!config.skipToken) {
      config.headers.set(AUTHORIZATION_HEADER, getAuthorization());
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    if (response.config.responseType === 'blob') {
      return response;
    }
    // Convert response data keys to camelCase
    response.data = convertKeysToCamelCase(response.data) as ApiResponse<unknown>;
    const data = response?.data;
    if (data && data.success === false) {
      if (data.statusCode === HttpStatus.Unauthorized) {
        handleSessionExpired(getErrorMessage(data.errors));
      } else {
        notifyMessageError(
          getErrorMessage(
            data.errors,
            RetcodeMessage[data.statusCode as RetcodeStatus],
          ),
        );
      }
    }
    return response;
  },
  async (error: AxiosError): Promise<AxiosResponse> => {
    const config = error.config as InternalAxiosRequestConfig | undefined;
    let data = error.response?.data as ApiResponse<unknown> | undefined;
    if (data) {
      data = convertKeysToCamelCase(data) as ApiResponse<unknown>;
    }
    const isUnauthorized =
      error.response?.status === HttpStatus.Unauthorized ||
      data?.statusCode === HttpStatus.Unauthorized;

    if (isUnauthorized && config && !config.retried && !config.skipAuthRefresh) {
      config.retried = true;
      try {
        await refreshSession();
        return apiClient.request(config);
      } catch {
        handleSessionExpired(getErrorMessage(data?.errors, RetcodeMessage[401]));
        return Promise.reject(error);
      }
    }

    if (isUnauthorized) {
      handleSessionExpired(getErrorMessage(data?.errors, RetcodeMessage[401]));
    } else if (data?.errors && data.errors.length > 0) {
      notifyMessageError(
        getErrorMessage(
          data.errors,
          RetcodeMessage[error.response?.status as RetcodeStatus],
        ),
      );
    } else {
      errorHandler(error);
    }
    return Promise.reject(error);
  },
);

export default apiClient;

export const get = <T = unknown>(url: string) => apiClient.get<T>(url);

export const post = <T = unknown>(url: string, body: unknown) =>
  apiClient.post<T>(url, { data: body });

export const drop = (): void => undefined;

export const put = (): void => undefined;
