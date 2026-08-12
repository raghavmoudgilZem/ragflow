import React, { useState } from 'react';
import { TextField, IconButton, InputAdornment, Box } from '@mui/material';
import type { TextFieldProps } from '@mui/material'; 

type CustomInputProps = Omit<TextFieldProps, 'error'> & {
  error?: string;
};

export const CustomInput: React.FC<CustomInputProps> = ({
  type = 'text',
  error,
  id,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const isPassword = type === 'password';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <TextField
        id={id}
        type={isPassword && showPassword ? 'text' : type}
        variant="outlined"
        fullWidth
        size="small"
        {...props}
        slotProps={{
          input: {
            endAdornment: isPassword ? (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  sx={{ color: '#64748b', p: 0.5, mr: 0.5 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {showPassword ? (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </>
                    )}
                  </svg>
                </IconButton>
              </InputAdornment>
            ) : undefined,
            sx: {
              bgcolor: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '6px',
              height: '35px',
              boxSizing: 'border-box',
              transition: 'all 0.2s ease',
              fontSize: '14px',
              
              '& input': {
                padding: '9px 14px',
                height: '35px',
                boxSizing: 'border-box',
                color: '#ffffff', 
              },
              
              '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
                WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
                WebkitTextFillColor: '#000000 !important',
                color: '#000000 !important',
                caretColor: '#000000 !important',
                transition: 'background-color 5000s ease-in-out 0s !important',
              },

              '&.Mui-focused input:-webkit-autofill, &.Mui-focused input:-webkit-autofill:hover, &.Mui-focused input:-webkit-autofill:focus': {
                WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
                WebkitTextFillColor: '#000000 !important',
                color: '#000000 !important',
                caretColor: '#000000 !important',
              },

              '&:has(input:-webkit-autofill) input': {
                color: '#000000 !important',
                WebkitTextFillColor: '#000000 !important',
              },

              '& fieldset': {
                borderColor: error ? '#ef4444' : 'rgba(255, 255, 255, 0.08)',
              },
              '&:hover fieldset': {
                borderColor: error ? '#ef4444' : 'rgba(255, 255, 255, 0.08) !important',
              },
              '&.Mui-focused fieldset': {
                borderColor: error ? '#ef4444' : '#00beb4 !important', 
                borderWidth: '1px',
              },
              '&.Mui-focused': {
                boxShadow: 'none !important',
              },
              '& input::placeholder': {
                color: '#4b5563 !important',
                opacity: 1,
              }
            }
          }
        }}
      />
    </Box>
  );
};