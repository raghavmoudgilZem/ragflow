import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchInputProps {
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
    placeholder = "Search",
    value,
    onChange
}) => {
    return (
        <TextField
            size="small"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{ color: '#52525b', fontSize: '16px' }} />
                        </InputAdornment>
                    ),
                    sx: {
                        color: '#fff',
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        fontSize: '13px',
                        height: '32px',
                        width: '140px',
                        paddingLeft: '4px',
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 255, 255, 0.2)'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 255, 255, 0.2)'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#00beb4',
                            borderWidth: '1px'
                        },
                    }
                }
            }}
        />
    );
};