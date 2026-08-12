import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@shared/utils/authorization', () => ({
  removeAll: vi.fn(),
  redirectToLogin: vi.fn(),
}));

vi.mock('./notification', () => ({
  notifyError: vi.fn(),
}));

import { handleSessionExpired, resetSessionExpiry } from './session';
import { removeAll, redirectToLogin } from '@shared/utils/authorization';
import { notifyError } from './notification';

beforeEach(() => {
  vi.clearAllMocks();
  resetSessionExpiry();
});

describe('handleSessionExpired', () => {
  it('clears auth, notifies once and redirects once on the first call', () => {
    handleSessionExpired('Session expired');
    expect(removeAll).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenCalledWith({
      message: 'Session expired',
      description: 'Session expired',
    });
    expect(redirectToLogin).toHaveBeenCalledTimes(1);
  });

  it('collapses a burst of calls into a single reaction', () => {
    handleSessionExpired('Session expired');
    handleSessionExpired('Session expired');
    handleSessionExpired('Session expired');
    expect(removeAll).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(redirectToLogin).toHaveBeenCalledTimes(1);
  });

  it('skips the notification when no message is provided', () => {
    handleSessionExpired();
    expect(notifyError).not.toHaveBeenCalled();
    expect(removeAll).toHaveBeenCalledTimes(1);
    expect(redirectToLogin).toHaveBeenCalledTimes(1);
  });
});

describe('resetSessionExpiry', () => {
  it('re-arms the handler for the next session', () => {
    handleSessionExpired('first');
    resetSessionExpiry();
    handleSessionExpired('second');
    expect(redirectToLogin).toHaveBeenCalledTimes(2);
    expect(removeAll).toHaveBeenCalledTimes(2);
  });
});
