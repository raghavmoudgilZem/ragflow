import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  SESSION_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  SESSION_EXPIRED_EVENT,
  getAuthorization,
  getRefreshToken,
  setSessionTokens,
  removeAll,
  redirectToLogin,
  isLoginRoute,
} from './authorization';

const createLocalStorageStub = () => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string): string | null => store.get(key) ?? null,
    setItem: (key: string, value: string): void => {
      store.set(key, value);
    },
    removeItem: (key: string): void => {
      store.delete(key);
    },
    clear: (): void => {
      store.clear();
    },
  };
};

describe('authorization util', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageStub());
    vi.stubGlobal('window', new EventTarget());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns a Bearer header when a token is stored', () => {
    localStorage.setItem(SESSION_TOKEN_KEY, 'abc123');
    expect(getAuthorization()).toBe('Bearer abc123');
  });

  it('returns an empty string when no token is stored', () => {
    expect(getAuthorization()).toBe('');
  });

  it('returns the stored refresh token', () => {
    localStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-abc');
    expect(getRefreshToken()).toBe('refresh-abc');
  });

  it('returns null when no refresh token is stored', () => {
    expect(getRefreshToken()).toBeNull();
  });

  it('setSessionTokens persists both the access and refresh tokens', () => {
    setSessionTokens({ accessToken: 'access-1', refreshToken: 'refresh-1' });
    expect(localStorage.getItem(SESSION_TOKEN_KEY)).toBe('access-1');
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh-1');
  });

  it('removeAll clears both the access and refresh tokens', () => {
    localStorage.setItem(SESSION_TOKEN_KEY, 'abc123');
    localStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-abc');
    removeAll();
    expect(localStorage.getItem(SESSION_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
  });

  it('redirectToLogin dispatches the session-expired event', () => {
    const listener = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, listener);
    redirectToLogin();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('isLoginRoute', () => {
  it('matches the login route', () => {
    expect(isLoginRoute('/login')).toBe(true);
  });

  it('matches the login route with a trailing slash', () => {
    expect(isLoginRoute('/login/')).toBe(true);
  });

  it('rejects nested paths under login', () => {
    expect(isLoginRoute('/login/extra')).toBe(false);
  });

  it('rejects unrelated paths', () => {
    expect(isLoginRoute('/')).toBe(false);
    expect(isLoginRoute('/loginx')).toBe(false);
  });
});