import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLogin } from './useLogin';
import { useAuthStore } from '../store/useAuthStore';

vi.mock('../store/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('useLogin Hook Suite', () => {
  const mockLoginUser = vi.fn();
  const mockRegisterUser = vi.fn();
  const mockClearAuthError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      isLoading: false,
      error: null,
      loginUser: mockLoginUser,
      registerUser: mockRegisterUser,
      clearAuthError: mockClearAuthError,
    } as any);
  });

  it('should initialize with baseline default form structures', () => {
    const { result } = renderHook(() => useLogin());
    expect(result.current.formData.email).toBe('');
    expect(result.current.formData.password).toBe('');
    expect(result.current.isSignUp).toBe(false);
  });

  it('should handle individual string value input modifications across all fields safely', () => {
    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.handleInputChange({ target: { name: 'email', value: 'veera@zemoso.com' } } as any);
      result.current.handleInputChange({ target: { name: 'nickname', value: 'Veera' } } as any);
      result.current.handleInputChange({ target: { name: 'password', value: 'SecurePass123' } } as any);
      result.current.handleInputChange({ target: { name: 'rememberMe', checked: true, type: 'checkbox' } } as any);
    });

    expect(result.current.formData.email).toBe('veera@zemoso.com');
    expect(result.current.formData.nickname).toBe('Veera');
    expect(result.current.formData.password).toBe('SecurePass123');
    expect(result.current.formData.rememberMe).toBe(true);
  });

  it('should toggle view modes between sign-in and sign-up setups cleanly', () => {
    const { result } = renderHook(() => useLogin());
    const mockEvent = { preventDefault: vi.fn() } as any;

    act(() => {
      result.current.toggleViewMode(mockEvent);
    });

    expect(result.current.isSignUp).toBe(true);
    expect(mockClearAuthError).toHaveBeenCalled();
  });

  it('should flag layout validation errors on invalid form submissions', async () => {
    const { result } = renderHook(() => useLogin());
    const mockEvent = { preventDefault: vi.fn() } as any;

    await act(async () => {
      await result.current.submitForm(mockEvent);
    });

    expect(result.current.errors.email).toBe('Email is required');
    expect(result.current.errors.password).toBe('Password is required');
    expect(mockLoginUser).not.toHaveBeenCalled();
  });

  it('should flag error configurations for passwords below 8 characters', async () => {
    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.handleInputChange({ target: { name: 'email', value: 'veera@zemosolabs.com' } } as any);
      result.current.handleInputChange({ target: { name: 'password', value: 'short1' } } as any);
    });

    await act(async () => {
      await result.current.submitForm({ preventDefault: vi.fn() } as any);
    });

    expect(result.current.errors.password).toBe('Password must be at least 8 characters long');
  });

  it('should execute login store pathways correctly on valid sign-in forms submission', async () => {
    mockLoginUser.mockResolvedValue(true);
    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.handleInputChange({ target: { name: 'email', value: 'veera@zemosolabs.com' } } as any);
      result.current.handleInputChange({ target: { name: 'password', value: 'ValidatedPassword123' } } as any);
    });

    await act(async () => {
      await result.current.submitForm({ preventDefault: vi.fn() } as any);
    });

    expect(mockLoginUser).toHaveBeenCalledWith({
      email: 'veera@zemosolabs.com',
      password: 'ValidatedPassword123'
    });
  });

  it('should validate missing nicknames and trigger sign up hooks during registration forms processing', async () => {
    mockRegisterUser.mockResolvedValue(true);
    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.toggleViewMode({ preventDefault: vi.fn() } as any);
    });

    act(() => {
      result.current.handleInputChange({ target: { name: 'email', value: 'veera@zemosolabs.com' } } as any);
      result.current.handleInputChange({ target: { name: 'password', value: 'ValidatedPassword123' } } as any);
    });

    await act(async () => {
      await result.current.submitForm({ preventDefault: vi.fn() } as any);
    });

    expect(result.current.errors.nickname).toBe('Nickname is required');

    act(() => {
      result.current.handleInputChange({ target: { name: 'nickname', value: 'Veera' } } as any);
    });

    await act(async () => {
      await result.current.submitForm({ preventDefault: vi.fn() } as any);
    });

    expect(mockRegisterUser).toHaveBeenCalledWith({
      email: 'veera@zemosolabs.com',
      password: 'ValidatedPassword123',
      nickname: 'Veera'
    });
  });
});