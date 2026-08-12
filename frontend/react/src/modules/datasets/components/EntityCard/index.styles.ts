/**
 * @author Shruthi
 * @description Styles for EntityCard component.
 */

import { type Theme } from '@mui/material/styles';

export const cardStyles =
  (isSelected: boolean) =>
  (theme: Theme) => ({
    backgroundColor: theme.palette.background.paper ?? '#1e1e1e',
    border: `1px solid ${theme.palette.divider ?? '#2d2d2d'}`,
    borderRadius: theme.shape.borderRadius ?? 8,
    cursor: 'pointer',
    minWidth: 240,
    position: 'relative',
    transition: 'border-color 0.2s ease',
    boxShadow: 'none',
    borderColor: isSelected
      ? theme.palette.primary.main
      : 'none',

    '&:hover': {
      borderColor: theme.palette.action?.hover ?? '#555',
    },
  });

export const checkboxStyles = (theme: Theme) => ({
  position: 'absolute',
  top: 6,
  left: 6,
  padding: 4,
  color: theme.palette.text.secondary ?? '#aaa',
  zIndex: 1,

  '&.Mui-checked': {
    color: theme.palette.primary.main,
  },
});

export const cardContentStyles = () => ({
  padding: '12px 14px !important',

  '&:last-child': {
    paddingBottom: '12px !important',
  },
});

export const topRowStyles = (theme: Theme) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1),
});

export const avatarContainerStyles = (theme: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.25),
});

export const avatarStyles = () => ({
  width: 32,
  height: 32,
  fontSize: 14,
});

export const menuButtonStyles = (theme: Theme) => ({
  color: theme.palette.text.secondary ?? '#aaa',
  padding: 0,
  flexShrink: 0,

  '&:hover': {
    color: theme.palette.text.primary ?? '#fff',
    backgroundColor: 'transparent',
  },
});

export const titleStyles = (theme: Theme) => ({
  fontSize: 14,
  fontWeight: 600,
  color: theme.palette.text.primary ?? '#ffffff',
  marginLeft: 42,
  lineHeight: 1.4,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
});

export const metaLineStyles = (theme: Theme) => ({
  fontSize: 12,
  color: theme.palette.text.secondary ?? '#888',
  marginTop: 2,
  marginLeft: 42,
  lineHeight: 1.4,
});