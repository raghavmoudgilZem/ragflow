import { useState } from 'react';
import { Box, ButtonBase, Typography, Avatar, IconButton, Menu, MenuItem, ListItemIcon } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { NAV_ITEMS } from './navItems.config';
import { useAuthStore } from '@modules/identity/store/useAuthStore';
import { ROUTES } from '@modules/identity/constants/routes';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';

export const AppNavBar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logoutAction = useAuthStore((state) => state.logoutAction);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  if (pathname.includes('/user-setting') || pathname.includes('/profile-setting')) {
    return null;
  }

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleCloseMenu();
    logoutAction();
    sessionStorage.clear();
    window.location.href = ROUTES.LOGIN;
  };

  const activeItem = NAV_ITEMS.find((item) =>
    item.matchPaths.some((p) => pathname.startsWith(p)),
  ) ?? null;

  // Compute fallback initial letter (e.g. 'V' for Veera)
  const avatarLetter = (user?.nickname || user?.name || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <Box
      component="nav"
      sx={(theme) => ({
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        paddingLeft: theme.spacing(5),
        paddingRight: theme.spacing(5),
        paddingTop: theme.spacing(2.5),
        paddingBottom: theme.spacing(2.5),
        bgcolor: 'var(--bg)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      })}
    >
      {/* Left — Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box
          component="img"
          src="/logo.svg"
          onClick={() => navigate(ROUTES.HOME)}
          sx={{ width: 40, cursor: 'pointer' }}
        />
      </Box>

      {/* Middle — Nav Links */}
      <Box
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          padding: theme.spacing(1.25),
          gap: theme.spacing(0.5),
          bgcolor: 'rgba(255, 255, 255, 0.06)',
          borderRadius: '9999px',
        })}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeItem?.path === item.path;
          const Icon = item.icon;

          return (
            <ButtonBase
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={(theme) => ({
                display: 'inline-flex',
                alignItems: 'center',
                gap: theme.spacing(0.75),
                paddingLeft: theme.spacing(item.iconOnly ? 1.5 : 3),
                paddingRight: theme.spacing(item.iconOnly ? 1.5 : 3),
                paddingTop: theme.spacing(1),
                paddingBottom: theme.spacing(1),
                borderRadius: '9999px',
                color: isActive ? '#111827' : 'rgba(255,255,255,0.65)',
                bgcolor: isActive ? 'rgba(255,255,255,0.93)' : 'transparent',
                boxShadow: isActive ? 'inset 0 -2px 0 0 #00beb4' : 'none',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: isActive
                    ? 'rgba(255,255,255,0.93)'
                    : 'rgba(255,255,255,0.1)',
                  color: isActive ? '#111827' : '#fff',
                },
              })}
            >
              {item.iconOnly ? (
                <Icon size={18} />
              ) : (
                <Typography
                  variant="body2"
                  component="span"
                  sx={{ lineHeight: 1, fontWeight: 500 }}
                >
                  {item.label}
                </Typography>
              )}
            </ButtonBase>
          );
        })}
      </Box>

      {/* Right — Active Profile Display & Dropdown controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
        <Typography
          variant="body2"
          sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500, display: { xs: 'none', sm: 'block' } }}
        >
          {user?.nickname || user?.name || user?.email || 'veera'}
        </Typography>

        <IconButton onClick={handleOpenMenu} sx={{ p: 0 }}>
          <Avatar
            src={user?.avatarUrl || undefined}
            alt={user?.nickname || 'User Avatar'}
            sx={{
              bgcolor: '#7c3aed',
              color: '#fff',
              fontWeight: '700',
              width: 34,
              height: 34,
              fontSize: '14px',
            }}
          >
            {avatarLetter}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          slotProps={{
            paper: {
              sx: {
                bgcolor: '#161925',
                color: '#fff',
                border: '1px solid #2a2f45',
                mt: 1.5,
                minWidth: '190px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)'
              }
            }
          }}
        >
          <MenuItem
            onClick={() => { handleCloseMenu(); navigate(ROUTES.USER_SETTING_PROFILE); }}
            sx={{ fontSize: '14px', py: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
          >
            <ListItemIcon><PersonIcon fontSize="small" sx={{ color: '#a0a5b5' }} /></ListItemIcon>
            Profile Settings
          </MenuItem>

          <MenuItem
            onClick={() => { handleCloseMenu(); navigate(ROUTES.USER_SETTING_TEAM); }}
            sx={{ fontSize: '14px', py: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
          >
            <ListItemIcon><SettingsIcon fontSize="small" sx={{ color: '#a0a5b5' }} /></ListItemIcon>
            Team Settings
          </MenuItem>

          <MenuItem
            onClick={handleLogoutClick}
            sx={{ fontSize: '14px', py: 1, color: '#ef4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' } }}
          >
            <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: '#ef4444' }} /></ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};