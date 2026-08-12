// components/EntityEmptyState/index.tsx
/**
 * @author Shruthi
 */
import React, { memo } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';

export interface EntityEmptyStateProps {
  icon: React.ReactNode;
  message: string;
  onAddClick: () => void;
  addButtonLabel?: string; // aria-label
}

const EntityEmptyState: React.FC<EntityEmptyStateProps> = ({
  icon,
  message,
  onAddClick,
  addButtonLabel = 'add',
}) => {
 
return (
  <Box
    sx={(theme) => ({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      padding: `${theme.spacing(7.5)} 0`,
    })}
    data-testid="entity-empty-state"
  >
    <Box
      component="span"
      sx={(theme) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 32,
        color: theme.palette.primary.main,
      })}
    >
      {icon}
    </Box>

    <Typography
      component="p"
      sx={(theme) => ({
        fontSize: theme.typography.body2.fontSize,
        color: theme.palette.text.secondary,
        margin: 0,
        textAlign: 'center',
        lineHeight: theme.typography.body2.lineHeight,
      })}
    >
      {message}
    </Typography>

    <IconButton
      data-testid="entity-empty-state-add-button"
      sx={(theme) => ({
        color: theme.palette.text.secondary,
        border: `1px solid ${theme.palette.action.disabled}`,
        borderRadius: theme.shape.borderRadius,
        padding: theme.spacing(0.75),
        transition: 'border-color 0.2s ease, color 0.2s ease',

        '&:hover': {
          borderColor: theme.palette.text.secondary,
          color: theme.palette.text.primary,
          backgroundColor: 'transparent',
        },

        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
      })}
      onClick={onAddClick}
      aria-label={addButtonLabel}
    >
      <Add />
    </IconButton>
  </Box>
);
};

export default memo(EntityEmptyState);