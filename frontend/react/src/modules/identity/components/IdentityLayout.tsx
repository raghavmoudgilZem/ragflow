/*
Note: This code is for project scaffolding only. Actual services are currently in development.
*/
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import type { IdentityLayoutProps } from '../types/identity.types';

export const IdentityLayout = ({ children }: IdentityLayoutProps) => {
  return (
    <Box
    >
      {children || <Outlet />}
    </Box>
  );
};