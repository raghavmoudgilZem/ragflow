import React from 'react';
import { Button, type ButtonProps } from '@mui/material';

interface ButtonComponentProps extends ButtonProps {
  children: React.ReactNode;
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({
  sx,
  children,
  ...props
}) => {
  return (
    <Button 
      {...props}
      sx={[
        { 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          padding: '16px 24px', // Clean, professional layout proportions
          borderRadius: 2,
          border: '1px solid var(--border)', // Generic baseline bounding border
          textTransform: 'none',
          color: 'text.secondary',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover',
            transform: 'translateY(-1px)', // Subtle premium lifting animation
          },
        }, 
        ...(Array.isArray(sx) ? sx : [sx]), // Parent styles always run last to override base values
      ]}
    >
      {children}
    </Button>
  );
};

export default ButtonComponent;
