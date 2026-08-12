import axios from 'axios';
import {
  getRefreshToken,
  setSessionTokens,
} from '@shared/utils/authorization';
import type { ApiResponse } from './envelope';
import { ApiErrorMessage } from './errorMessages';

interface RefreshResponseData {
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

const REFRESH_ENDPOINT = '/auth/refresh';

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

let pendingRefresh: Promise<string> | null = null;

const requestNewTokens = async (): Promise<string> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error(ApiErrorMessage.missingRefreshToken);
  }
  const response = await refreshClient.post<
    ApiResponse<RefreshResponseData | null>
  >(REFRESH_ENDPOINT, {
    refresh_token: refreshToken,
  });
  const { success, data } = response.data;
  if (!success || !data?.access_token || !data?.refresh_token) {
    throw new Error(ApiErrorMessage.tokenRefreshRejected);
  }
  setSessionTokens({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  });
  return data.access_token;
};

export const refreshSession = (): Promise<string> => {
  if (!pendingRefresh) {
    pendingRefresh = requestNewTokens().finally(() => {
      pendingRefresh = null;
    });
  }
  return pendingRefresh;
};
