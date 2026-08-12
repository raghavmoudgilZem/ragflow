import React from 'react';
import { Button, CircularProgress, Box } from '@mui/material';
import type { ButtonProps } from '@mui/material';

interface CustomButtonProps extends ButtonProps {
  isLoading?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  isLoading,
  disabled,
  sx,
  ...props
}) => {
  const active = !disabled && !isLoading;

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <Button
        type={props.type || "button"}
        disabled={!active}
        fullWidth
        sx={{
          py: "11px",
          px: "18px",
          height: "35px",
          bgcolor: active ? "#ffffff" : "#d1d5db",
          backgroundImage: active
            ? 'linear-gradient(104deg, #ffffff 30%, #ffffff 50%, #ffffff 70%)'
            : 'none',
          color: active ? '#000000' : '#6b7280',
          border: '1px solid transparent',
          borderBottom: active ? '2px solid #00beb4' : '1px solid transparent',
          borderRadius: '5px',
          fontSize: '14px',
          fontWeight: 600,
          textTransform: 'none',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box',
          boxShadow: active ? '0 4px 12px rgba(0, 0, 0, 0.16)' : '0 2px 6px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            bgcolor: active ? '#f3f4f6' : '#d1d5db',
            boxShadow: active ? '0 6px 16px rgba(0, 0, 0, 0.22)' : '0 2px 6px rgba(0, 0, 0, 0.08)',
          },
          '&.Mui-disabled': {
            bgcolor: '#d1d5db',
            color: '#6b7280',
          },
          ...sx
        }}
        {...props}
      >
        {isLoading ? (
          <CircularProgress size={16} sx={{ color: '#000000' }} />
        ) : (
          children
        )}
      </Button>
    </Box>
  );
};