import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LOGIN_ROUTE,
  SESSION_EXPIRED_EVENT,
  isLoginRoute,
} from '@shared/utils/authorization';
import { resetSessionExpiry } from '@shared/api/session';
import { useIdentity } from '@modules/identity';

export const useAuthSessionGuard = (): void => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useIdentity((state) => state.logout);

  const pathnameRef = useRef(location.pathname);
  const logoutRef = useRef(logout);

  useEffect(() => {
    pathnameRef.current = location.pathname;
    logoutRef.current = logout;
  }, [location.pathname, logout]);

  useEffect(() => {
    const handleSessionExpiredEvent = (): void => {
      logoutRef.current();
      if (!isLoginRoute(pathnameRef.current)) {
        navigate(LOGIN_ROUTE, { replace: true });
      }
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpiredEvent);
    return () => {
      window.removeEventListener(
        SESSION_EXPIRED_EVENT,
        handleSessionExpiredEvent,
      );
    };
  }, [navigate]);

  useEffect(() => {
    if (isLoginRoute(location.pathname)) {
      resetSessionExpiry();
    }
  }, [location.pathname]);
};
