export const AUTHORIZATION_HEADER = 'Authorization';
export const SESSION_TOKEN_KEY = 'ragflow_session_token';
export const REFRESH_TOKEN_KEY = 'ragflow_refresh_token';
export const SESSION_EXPIRED_EVENT = 'auth-session-expired';
export const LOGIN_ROUTE = '/login';

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

const LOGIN_ROUTE_PATTERN = /^\/login\/?$/;

export const isLoginRoute = (pathname: string): boolean =>
  LOGIN_ROUTE_PATTERN.test(pathname);

export const getAuthorization = (): string => {
  const token = localStorage.getItem(SESSION_TOKEN_KEY);
  return token ? `Bearer ${token}` : '';
};

export const getRefreshToken = (): string | null =>
  localStorage.getItem(REFRESH_TOKEN_KEY);

export const setSessionTokens = (tokens: SessionTokens): void => {
  localStorage.setItem(SESSION_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
};

export const removeAll = (): void => {
  localStorage.removeItem(SESSION_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const redirectToLogin = (): void => {
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
};
