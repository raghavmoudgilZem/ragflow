import React from 'react';
import { Box, Typography, Slider } from '@mui/material';
import { BaseTooltip } from './BaseToolTip';

interface BaseSliderProps {
    label?: string;
    value: number;
    onChange: (val: number) => void;
    min?: number;
    max?: number;
    step?: number;
    displayValue?: string; // Optional: custom format for the right box text
    children?: React.ReactNode; // Optional: for inserting sub-labels (like your vector vs full-text text)
    disabled?: boolean;
    sx?: Object;
    tooltipText?: string;
}

export const BaseSlider = ({
    label,
    value,
    onChange,
    min = 0,
    max = 1,
    step = 0.1,
    displayValue,
    children,
    disabled = false,
    sx,
    tooltipText
}: BaseSliderProps) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%', ...sx }}>
            {/* Label and Info Icon */}
            {/* Dynamic Conditional Render: Only renders layout row if label exists */}
            {label && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: children ? 0 : 1 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500, fontSize: '12px' }}>
                        {label} {/* Fixed the hardcoded typo here */}
                    </Typography>
                    <BaseTooltip text={tooltipText || ''} />
                </Box>
            )}

            {/* Optional Sub-labels slot */}
            {children}

            {/* Slider and Value Container */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Slider
                    value={value}
                    min={min}
                    max={max}
                    step={step}
                    disabled={disabled}
                    onChange={(_, val) => onChange(val as number)}
                    sx={{
                        color: '#06b6d4',
                        height: 2,
                        flex: 1,
                        '& .MuiSlider-thumb': { width: 10, height: 10, backgroundColor: '#06b6d4' },
                    }}
                />
                <Box
                    sx={{
                        backgroundColor: '#13151a',
                        border: '1px solid #22252e',
                        borderRadius: '4px',
                        px: 1.5,
                        py: 0.5,
                        minWidth: '32px',
                        textAlign: 'center',
                    }}
                >
                    <Typography sx={{ fontSize: '12px', color: '#e2e8f0' }}>
                        {displayValue ?? value.toFixed(1)}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};
