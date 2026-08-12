import React from 'react';
import { Box, Typography, Select, MenuItem, OutlinedInput } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// Interface supports both plain strings or objects with distinct labels/values
export interface DropdownItem {
    value: string | number;
    label: string;
}

interface BaseDropdownProps {
    label?: string;
    placeholder?: string;
    value: string | number | '';
    onChange: (val: any) => void;
    items: (string | number | DropdownItem)[];
    fullWidth?: boolean;
}

export const BaseDropdown = ({
    label,
    placeholder = 'Select an option...',
    value,
    onChange,
    items,
    fullWidth = true,
}: BaseDropdownProps) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: fullWidth ? '100%' : 'auto' }}>
            {/* Optional Header Label */}
            {label && (
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500, fontSize: '12px' }}>
                    {label}
                </Typography>
            )}

            <Select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                displayEmpty
                renderValue={(selected) => {
                    // If no item is selected, display the stylized placeholder text
                    if (selected === '' || selected === undefined || selected === null) {
                        return <Typography sx={{ color: '#475569', fontSize: '13px' }}>{placeholder}</Typography>;
                    }

                    // Find label text if items array uses the object schema
                    const currentItem = items.find(item => typeof item === 'object' && item.value === selected);
                    return (currentItem as DropdownItem)?.label ?? (selected as string);
                }}
                IconComponent={KeyboardArrowDownIcon}
                input={<OutlinedInput />}
                sx={{
                    height: '38px',
                    backgroundColor: '#13151a',
                    borderRadius: '6px',
                    color: '#e2e8f0',
                    fontSize: '13px',
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#22252e',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#334155',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6366f1', // Focus color matching your switches
                    },
                    '& .MuiSelect-icon': {
                        color: '#94a3b8',
                        fontSize: '18px',
                    },
                }}
                MenuProps={{
                    slotProps: {
                        paper: {
                            sx: {
                                backgroundColor: '#13151a',
                                border: '1px solid #22252e',
                                color: '#e2e8f0',
                                marginTop: '4px',
                                '& .MuiMenuItem-root': {
                                    fontSize: '13px',
                                    padding: '8px 12px',
                                    '&:hover': {
                                        backgroundColor: '#1e222b',
                                    },
                                    '&.Mui-selected': {
                                        backgroundColor: '#22252e',
                                        fontWeight: 600,
                                        '&:hover': {
                                            backgroundColor: '#2e3342',
                                        },
                                    },
                                },
                            },
                        },
                    },
                }}

            >
                {/* Render Dropdown Items */}
                {items.map((item, idx) => {
                    const isObject = typeof item === 'object';
                    const itemValue = isObject ? (item as DropdownItem).value : item;
                    const itemLabel = isObject ? (item as DropdownItem).label : item;

                    return (
                        <MenuItem key={idx} value={itemValue}>
                            {itemLabel}
                        </MenuItem>
                    );
                })}
            </Select>
        </Box>
    );
};
