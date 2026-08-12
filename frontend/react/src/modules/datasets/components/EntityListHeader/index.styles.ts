import type { SxProps, Theme } from '@mui/material';

export const rootStyles: SxProps<Theme> = (theme) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${theme.spacing(1.5)} 0 ${theme.spacing(2.5)}`,
});

export const leftSectionStyles: SxProps<Theme> = (theme) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.25),
});

export const iconStyles: SxProps<Theme> = (theme) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.primary.main,
  fontSize: 22,
});

export const titleStyles: SxProps<Theme> = (theme) => ({
  fontSize: theme.typography.h5.fontSize,
  fontWeight: theme.typography.fontWeightBold,
  color: theme.palette.text.primary,
  margin: 0,
  lineHeight: 1.2,
});

export const rightSectionStyles: SxProps<Theme> = (theme) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
});

export const filterButtonStyles: SxProps<Theme> = (theme) => ({
  color: theme.palette.text.secondary,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.75),
  transition: 'border-color 0.2s ease, color 0.2s ease',
  background: 'none',

  '&:hover': {
    borderColor: theme.palette.text.secondary,
    color: theme.palette.text.primary,
    backgroundColor: 'transparent',
  },
});

export const searchContainerStyles: SxProps<Theme> = (theme) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: `${theme.spacing(0.5)} ${theme.spacing(1.25)}`,
  gap: theme.spacing(0.75),
  minWidth: 180,
  transition: 'border-color 0.2s ease',

  '&:focus-within': {
    borderColor: theme.palette.primary.main,
  },
});

export const searchInputStyles: SxProps<Theme> = (theme) => ({
  color: theme.palette.text.primary,
  fontSize: theme.typography.body2.fontSize,
  flex: 1,
  width: '100%',

  '& input::placeholder': {
    color: theme.palette.text.disabled,
    opacity: 1,
  },
});

export const createButtonStyles: SxProps<Theme> = (theme) => ({
  backgroundColor: theme.palette.common.white,
  color: theme.palette.common.black,
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightBold,
  fontSize: theme.typography.body2.fontSize,
  borderRadius: theme.shape.borderRadius,
  padding: `${theme.spacing(0.625)} ${theme.spacing(1.75)}`,
  whiteSpace: 'nowrap',
  boxShadow: 'none',

  '&:hover': {
    backgroundColor: theme.palette.grey[200],
    boxShadow: 'none',
  },

  '&:active': {
    backgroundColor: theme.palette.grey[300],
    boxShadow: 'none',
  },
});