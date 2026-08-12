import React from 'react';
import { Typography, Switch, FormControlLabel, styled } from '@mui/material';

// Kept your custom styling isolated inside the reusable component
const CustomSwitch = styled(Switch)(() => ({
    width: 36,
    height: 20,
    padding: 0,
    display: 'flex',
    '& .MuiSwitch-switchBase': {
        padding: 2,
        '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': { opacity: 1, backgroundColor: '#06b6d4' },
        },
    },
    '& .MuiSwitch-thumb': { width: 16, height: 16, borderRadius: 8, backgroundColor: '#ffffff', boxShadow: 'none' },
    '& .MuiSwitch-track': { borderRadius: 10, opacity: 1, backgroundColor: '#22252e' },
}));

interface BaseSwitchProps {
    label?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    sx?: Object;
}

export const BaseSwitch = ({ label, checked, onChange, sx }: BaseSwitchProps) => {
    return (
        <FormControlLabel
            control={
                <CustomSwitch
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                />
            }
            label={
                label &&
                <Typography sx={{ fontSize: '13px', marginLeft: '10px', color: '#94a3b8' }}>
                    {label}
                </Typography>
            }
            sx={{ m: 0, justifyContent: 'flex-start', width: '100%', ...sx }}
        />
    );
};
