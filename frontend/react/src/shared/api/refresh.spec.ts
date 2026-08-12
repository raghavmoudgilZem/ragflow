import { describe, it, expect, beforeEach, vi } from 'vitest';

const { postMock } = vi.hoisted(() => ({ postMock: vi.fn() }));

vi.mock('axios', () => ({
  default: {
    create: () => ({ post: postMock }),
  },
}));

vi.mock('@shared/utils/authorization', () => ({
  getRefreshToken: vi.fn(),
  setSessionTokens: vi.fn(),
}));

import { refreshSession } from './refresh';
import { ApiErrorMessage } from './errorMessages';
import { getRefreshToken, setSessionTokens } from '@shared/utils/authorization';

const successPayload = {
  data: {
    success: true,
    status_code: 200,
    errors: [],
    data: {
      access_token: 'new-access',
      refresh_token: 'new-refresh',
      expires_at: '2026-06-23T08:08:33.828424Z',
    },
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getRefreshToken).mockReturnValue('stored-refresh');
});

describe('refreshSession', () => {
  it('posts the stored refresh token and persists the rotated pair', async () => {
    postMock.mockResolvedValue(successPayload);

    const accessToken = await refreshSession();

    expect(postMock).toHaveBeenCalledWith('/auth/refresh', {
      refresh_token: 'stored-refresh',
    });
    expect(setSessionTokens).toHaveBeenCalledWith({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });
    expect(accessToken).toBe('new-access');
  });

  it('rejects without calling the endpoint when no refresh token is stored', async () => {
    vi.mocked(getRefreshToken).mockReturnValue(null);

    await expect(refreshSession()).rejects.toThrow(
      ApiErrorMessage.missingRefreshToken,
    );
    expect(postMock).not.toHaveBeenCalled();
  });

  it('rejects and does not persist when the envelope reports failure', async () => {
    postMock.mockResolvedValue({
      data: { success: false, status_code: 401, errors: ['expired'], data: null },
    });

    await expect(refreshSession()).rejects.toThrow(
      ApiErrorMessage.tokenRefreshRejected,
    );
    expect(setSessionTokens).not.toHaveBeenCalled();
  });

  it('deduplicates concurrent refreshes into a single request', async () => {
    let resolvePost: (value: typeof successPayload) => void = () => undefined;
    postMock.mockReturnValue(
      new Promise((resolve) => {
        resolvePost = resolve;
      }),
    );

    const first = refreshSession();
    const second = refreshSession();
    resolvePost(successPayload);

    await Promise.all([first, second]);
    expect(postMock).toHaveBeenCalledTimes(1);
  });

  it('allows a fresh request after the previous one settles', async () => {
    postMock.mockResolvedValue(successPayload);

    await refreshSession();
    await refreshSession();

    expect(postMock).toHaveBeenCalledTimes(2);
  });
});
