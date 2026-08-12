import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuthStore } from '../store/useAuthStore';

vi.mock('../store/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('../constants/routes', () => ({
  ROUTES: {
    LOGIN: '/login-next',
    ROOT: '/'
  }
}));

vi.mock('@shared/components/common/PageLoader', () => ({
  default: () => <div data-testid="loader-spinner">Mock Loading...</div>
}));

describe('ProtectedRoute Guard Suite', () => {
  const mockLogoutAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render a full-screen spinner if the state is loading', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isLoading: true,
      logoutAction: mockLogoutAction,
      clearAuthError: vi.fn(),
      registerUser: vi.fn(),
      loginUser: vi.fn(),
      error: null
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected View Grid</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('loader-spinner')).toBeDefined();
    expect(screen.queryByText('Protected View Grid')).toBeNull();
  });

  it('should mount child nodes seamlessly if user authentication parameters exist', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: 'usr-ok' } as any,
      isLoading: false,
      logoutAction: mockLogoutAction,
      clearAuthError: vi.fn(),
      registerUser: vi.fn(),
      loginUser: vi.fn(),
      error: null
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected View Grid</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected View Grid')).toBeDefined();
  });

  it('should safely render fallback layout Outlets when no direct child element exists', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: 'usr-ok' } as any,
      isLoading: false,
      logoutAction: mockLogoutAction,
      clearAuthError: vi.fn(),
      registerUser: vi.fn(),
      loginUser: vi.fn(),
      error: null
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<div>Nested Layout View Element</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Nested Layout View Element')).toBeDefined();
  });

  it('should force immediate eviction loops and kick unauthenticated workflows to login paths', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isLoading: false,
      logoutAction: mockLogoutAction,
      clearAuthError: vi.fn(),
      registerUser: vi.fn(),
      loginUser: vi.fn(),
      error: null
    });

    render(
      <MemoryRouter initialEntries={['/dashboard-secure']}>
        <Routes>
          <Route path="/dashboard-secure" element={
            <ProtectedRoute>
              <div>Protected View Grid</div>
            </ProtectedRoute>
          } />
          <Route path="/login-next" element={<div>Target Login Gateway Container</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Protected View Grid')).toBeNull();
    expect(mockLogoutAction).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Target Login Gateway Container')).toBeDefined();
  });
});
