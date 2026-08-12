import { Box } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import { AppNavBar } from './AppNavBar';

const HIDE_NAV_PREFIXES = ['/chunk'];

export const AppLayout = () => {
  const { pathname } = useLocation();
  const hideNav = HIDE_NAV_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isChunkPage = pathname.startsWith('/chunk');

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isChunkPage ? 'var(--chunk-page-bg)' : 'var(--bg)',
        overflow: 'hidden',
      }}
    >
      {!hideNav && <AppNavBar />}
      <Box
        component="main"
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: isChunkPage ? 'hidden' : 'auto',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
