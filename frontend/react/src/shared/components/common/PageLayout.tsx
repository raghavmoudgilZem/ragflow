import React from 'react';
import { Box, type BoxProps } from '@mui/material';

interface PageLayoutProps extends BoxProps {
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  ...rest
}) => {

  return (
    <Box
      sx={{
        minHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        width: '100%',
      }}
    >
      <Box
        component="main"
        {...rest}
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 4,
          ...rest.sx, // Allows overriding styles if needed externally
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
