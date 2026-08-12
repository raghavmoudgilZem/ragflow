import { type SxProps, type Theme } from '@mui/material';

export const styles: {
  card: SxProps<Theme>;
  box: SxProps<Theme>;
  iconButton: SxProps<Theme>;
} = {
  card: {
    height: '100%',
    bgcolor: 'var(--bg)',
    border: '0.06rem solid var(--border)',
    position: 'relative',
    '&:hover .delete-btn-target': {
      opacity: 1,
    },
  },
  box: {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    zIndex: 2,
    opacity: { xs: 1, md: 0.6 },
    transition: 'opacity 0.2s ease',
  },
  iconButton: {
    color: 'text.secondary',
    '&:hover': {
      color: 'error.main',
      bgcolor: 'error.lighter',
    },
  },
};
