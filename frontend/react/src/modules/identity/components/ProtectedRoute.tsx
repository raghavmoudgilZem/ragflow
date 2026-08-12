import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { ROUTES } from '../constants/routes';
import PageLoader from '@shared/components/common/PageLoader';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading, logoutAction } = useAuthStore();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) {
    logoutAction(); 
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};