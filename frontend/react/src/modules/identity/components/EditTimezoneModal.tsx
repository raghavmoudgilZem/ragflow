import React, { useState, useEffect } from 'react';
import { Box, MenuItem, Select, TextField, Typography, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { BaseModal } from './BaseModal';
import { PALETTE } from '../../../shared/theme/theme';

interface EditTimezoneModalProps {
    open: boolean;
    currentTimezone: string;
    onClose: () => void;
    onSave: (newTimezone: string) => Promise<boolean>;
}

const TIMEZONE_OPTIONS = [
    'UTC+8 Asia/Shanghai',
    'UTC+0 UTC',
    'UTC-5 America/New_York',
    'UTC+1 Europe/London',
    'UTC+5:30 Asia/Kolkata',
    'UTC+9 Asia/Tokyo',
    'UTC-8 America/Los_Angeles',
    'UTC+10 Australia/Sydney'
];

export const EditTimezoneModal: React.FC<EditTimezoneModalProps> = ({ open, currentTimezone, onClose, onSave }) => {
    const [selectedTz, setSelectedTz] = useState(currentTimezone);
    const [searchQuery, setSearchQuery] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setSelectedTz(currentTimezone);
        setSearchQuery('');
        setErrorMessage(null);
    }, [currentTimezone, open]);

    const filteredTimezones = TIMEZONE_OPTIONS.filter(tz =>
        tz.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const success = await onSave(selectedTz);
            if (success) {
                onClose();
            } else {
                setErrorMessage('Failed to update timezone.');
            }
        } catch (err) {
            setErrorMessage('An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <BaseModal
            open={open}
            onClose={onClose}
            title="Edit Time Zone"
            onSubmit={handleSave}
            isSubmitting={isSubmitting}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography component="label" sx={{ fontSize: '0.85rem', color: PALETTE.text.secondary, mb: '0.5rem', fontWeight: 500 }}>
                    Time zone
                </Typography>

                <Select
                    value={selectedTz}
                    onChange={(e) => {
                        setSelectedTz(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                    }}
                    fullWidth
                    sx={{
                        color: PALETTE.text.secondary,
                        backgroundColor: PALETTE.background.input,
                        fontSize: '0.9rem',
                        height: '2.25rem',
                        borderRadius: '0.375rem',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: errorMessage ? PALETTE.text.danger : PALETTE.border.default },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: errorMessage ? PALETTE.text.danger : PALETTE.border.hover },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: errorMessage ? PALETTE.text.danger : PALETTE.border.focus }
                    }}
                    MenuProps={{
                        slotProps: {
                            paper: {
                                sx: {
                                    backgroundColor: PALETTE.background.paper,
                                    color: PALETTE.text.primary,
                                    border: `0.0625rem solid ${PALETTE.border.default}`,
                                    maxHeight: '15rem',
                                }
                            }
                        }
                    }}
                >
                    <Box sx={{ p: '0.5rem', position: 'sticky', top: 0, backgroundColor: PALETTE.background.paper, zIndex: 1 }}>
                        <TextField
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            fullWidth
                            size="small"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: PALETTE.text.muted, fontSize: '1rem' }} />
                                        </InputAdornment>
                                    )
                                }
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: PALETTE.text.primary,
                                    backgroundColor: PALETTE.background.input,
                                    fontSize: '0.85rem',
                                    height: '2rem'
                                }
                            }}
                        />
                    </Box>
                    {filteredTimezones.map((tz) => (
                        <MenuItem key={tz} value={tz} sx={{ fontSize: '0.85rem', '&:hover': { backgroundColor: PALETTE.background.buttonDark } }}>
                            {tz}
                        </MenuItem>
                    ))}
                </Select>

                {errorMessage && (
                    <Typography sx={{ color: PALETTE.text.danger, fontSize: '0.8rem', mt: '0.375rem', fontWeight: 400 }}>
                        {errorMessage}
                    </Typography>
                )}
            </Box>
        </BaseModal>
    );
};