// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, act, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SESSION_EXPIRED_EVENT } from '@shared/utils/authorization';

const navigateMock = vi.fn();
const logoutMock = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock('@modules/identity', () => ({
  useIdentity: (selector: (state: { logout: () => void }) => unknown) =>
    selector({ logout: logoutMock }),
}));

vi.mock('@shared/api/session', () => ({
  resetSessionExpiry: vi.fn(),
}));

import { useAuthSessionGuard } from './useAuthSessionGuard';
import { resetSessionExpiry } from '@shared/api/session';

const GuardHarness = (): null => {
  useAuthSessionGuard();
  return null;
};

const renderAt = (pathname: string): void => {
  render(
    <MemoryRouter initialEntries={[pathname]}>
      <GuardHarness />
    </MemoryRouter>,
  );
};

const dispatchSessionExpired = (): void => {
  act(() => {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  });
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('useAuthSessionGuard', () => {
  it('logs out and redirects to login once when the session expires off the login route', () => {
    renderAt('/');
    dispatchSessionExpired();
    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('logs out without navigating when already on the login route', () => {
    renderAt('/login');
    dispatchSessionExpired();
    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('resets the single-flight guard when landing on the login route', () => {
    renderAt('/login');
    expect(resetSessionExpiry).toHaveBeenCalledTimes(1);
  });

  it('does not reset the guard on a non-login route', () => {
    renderAt('/');
    expect(resetSessionExpiry).not.toHaveBeenCalled();
  });
});
