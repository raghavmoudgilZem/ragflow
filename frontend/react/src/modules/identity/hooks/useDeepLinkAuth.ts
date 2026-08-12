import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';

export interface OAuthErrorNotification {
    open: boolean;
    message: string;
}

export interface UseDeepLinkAuthReturn {
    oauthError: OAuthErrorNotification;
    closeOauthError: () => void;
}

export const useDeepLinkAuth = (): UseDeepLinkAuthReturn => {
    const [oauthError, setOauthError] = useState<OAuthErrorNotification>({
        open: false,
        message: ''
    });

    const updateProfileState = useAuthStore((state) => state.updateProfileState);

    const closeOauthError = useCallback(() => {
        setOauthError({ open: false, message: '' });
    }, []);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const authToken = searchParams.get('auth');
        const authCode = searchParams.get('code');
        const errorParam = searchParams.get('error');

        let urlNeedsCleaning = false;

        if (authToken) {
            sessionStorage.setItem('accessToken', authToken);
            urlNeedsCleaning = true;
        }

        if (authCode) {
            sessionStorage.setItem('accessToken', `exchanged_jwt_token_${authCode}`);
            urlNeedsCleaning = true;
        }

        if (errorParam) {
            urlNeedsCleaning = true;
            if (errorParam === 'oauth_cancelled') {
                setOauthError({
                    open: true,
                    message: 'OAuth sign-in was cancelled. Please try signing in again.'
                });
            } else {
                setOauthError({
                    open: true,
                    message: `Authentication error: ${errorParam.replace(/_/g, ' ')}`
                });
            }
        }

        if (urlNeedsCleaning) {
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
        }
    }, [updateProfileState]);

    return {
        oauthError,
        closeOauthError
    };
};

export default useDeepLinkAuth;