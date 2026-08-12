import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { BaseModal } from './BaseModal';
import { PALETTE } from '../../../shared/theme/theme';

interface EditNameModalProps {
    open: boolean;
    currentName: string;
    onClose: () => void;
    onSave: (newName: string) => Promise<boolean>;
}

export const EditNameModal: React.FC<EditNameModalProps> = ({ open, currentName, onClose, onSave }) => {
    const [name, setName] = useState(currentName);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setName(currentName);
        setErrorMessage(null);
    }, [currentName, open]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setErrorMessage('Please input your username!');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const success = await onSave(name.trim());
            if (success) {
                onClose();
            } else {
                setErrorMessage('Failed to update name. Please try again.');
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
            title="Edit Name"
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography component="label" sx={{ fontSize: '0.85rem', color: PALETTE.text.secondary, mb: '0.5rem', fontWeight: 500 }}>
                    Name
                </Typography>

                <TextField
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                    }}
                    fullWidth
                    autoFocus
                    autoComplete="name"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            color: PALETTE.text.primary,
                            backgroundColor: PALETTE.background.input,
                            fontSize: '0.9rem',
                            height: '2.25rem',
                            borderRadius: '0.375rem',
                            overflow: 'hidden', // Clips autofill background and focus highlights strictly inside input border
                            '& fieldset': { borderColor: errorMessage ? PALETTE.text.danger : PALETTE.border.default },
                            '&:hover fieldset': { borderColor: errorMessage ? PALETTE.text.danger : PALETTE.border.hover },
                            '&.Mui-focused fieldset': { borderColor: errorMessage ? PALETTE.text.danger : PALETTE.border.focus, borderWidth: '0.0625rem' }
                        },
                        '& .MuiOutlinedInput-input': {
                            borderRadius: '0.375rem',
                            '&:-webkit-autofill': {
                                WebkitBoxShadow: '0 0 0 100px #ffffff inset !important', // Forces white background on autofill
                                WebkitTextFillColor: '#000000 !important',             // Forces black text on autofill
                                borderRadius: '0.375rem !important',
                                caretColor: '#000000',
                            },
                            '&:-webkit-autofill:hover': {
                                WebkitBoxShadow: '0 0 0 100px #ffffff inset !important',
                                WebkitTextFillColor: '#000000 !important',
                            },
                            '&:-webkit-autofill:focus': {
                                WebkitBoxShadow: '0 0 0 100px #ffffff inset !important',
                                WebkitTextFillColor: '#000000 !important',
                            },
                            '&:-webkit-autofill:active': {
                                WebkitBoxShadow: '0 0 0 100px #ffffff inset !important',
                                WebkitTextFillColor: '#000000 !important',
                            },
                        }
                    }}
                />

                {errorMessage && (
                    <Typography sx={{ color: PALETTE.text.danger, fontSize: '0.8rem', mt: '0.375rem', fontWeight: 400 }}>
                        {errorMessage}
                    </Typography>
                )}
            </Box>
        </BaseModal>
    );
};