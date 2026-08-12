import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useDeepLinkAuth } from './useDeepLinkAuth';

describe('useDeepLinkAuth Hook', () => {
    const originalLocation = window.location;
    const originalHistoryReplaceState = window.history.replaceState;

    beforeEach(() => {
        sessionStorage.clear();
        window.history.replaceState = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        window.history.replaceState = originalHistoryReplaceState;
    });

    const setWindowLocationSearch = (search: string) => {
        delete (window as any).location;
        window.location = {
            ...originalLocation,
            origin: 'http://localhost:5173',
            pathname: '/login',
            search,
        } as any;
    };

    it('should return default initial state when no deep link params exist', () => {
        setWindowLocationSearch('');

        const { result } = renderHook(() => useDeepLinkAuth());

        expect(result.current.oauthError).toEqual({ open: false, message: '' });
        expect(sessionStorage.getItem('accessToken')).toBeNull();
        expect(window.history.replaceState).not.toHaveBeenCalled();
    });

    it('should store accessToken when "auth" URL query parameter is present', () => {
        setWindowLocationSearch('?auth=mock_token_123');

        const { result } = renderHook(() => useDeepLinkAuth());

        expect(sessionStorage.getItem('accessToken')).toBe('mock_token_123');
        expect(window.history.replaceState).toHaveBeenCalledWith(
            {},
            document.title,
            'http://localhost:5173/login'
        );
        expect(result.current.oauthError).toEqual({ open: false, message: '' });
    });

    it('should store exchanged accessToken when "code" URL query parameter is present', () => {
        setWindowLocationSearch('?code=oauth_code_456');

        const { result } = renderHook(() => useDeepLinkAuth());

        expect(sessionStorage.getItem('accessToken')).toBe('exchanged_jwt_token_oauth_code_456');
        expect(window.history.replaceState).toHaveBeenCalledWith(
            {},
            document.title,
            'http://localhost:5173/login'
        );
    });

    it('should handle "oauth_cancelled" error search parameter', () => {
        setWindowLocationSearch('?error=oauth_cancelled');

        const { result } = renderHook(() => useDeepLinkAuth());

        expect(result.current.oauthError).toEqual({
            open: true,
            message: 'OAuth sign-in was cancelled. Please try signing in again.'
        });
        expect(window.history.replaceState).toHaveBeenCalledWith(
            {},
            document.title,
            'http://localhost:5173/login'
        );
    });

    it('should handle generic error search parameter and format underscores', () => {
        setWindowLocationSearch('?error=invalid_request_scope');

        const { result } = renderHook(() => useDeepLinkAuth());

        expect(result.current.oauthError).toEqual({
            open: true,
            message: 'Authentication error: invalid request scope'
        });
        expect(window.history.replaceState).toHaveBeenCalledWith(
            {},
            document.title,
            'http://localhost:5173/login'
        );
    });

    it('should reset oauthError state when closeOauthError callback is invoked', () => {
        setWindowLocationSearch('?error=oauth_cancelled');

        const { result } = renderHook(() => useDeepLinkAuth());

        expect(result.current.oauthError.open).toBe(true);

        act(() => {
            result.current.closeOauthError();
        });

        expect(result.current.oauthError).toEqual({ open: false, message: '' });
    });
});