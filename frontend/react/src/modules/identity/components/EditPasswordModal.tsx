import React, { useState, useEffect } from 'react';
import { Box, TextField, IconButton, Typography, InputAdornment } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { passwordSchema, type PasswordSchemaType } from '../schemas/passwordSchema';
import { BaseModal } from './BaseModal';
import { PALETTE } from '../../../shared/theme/theme';

interface EditPasswordModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (currentPass: string, newPass: string) => Promise<boolean>;
}

export const EditPasswordModal: React.FC<EditPasswordModalProps> = ({ open, onClose, onSave }) => {
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<PasswordSchemaType>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        }
    });

    useEffect(() => {
        if (open) {
            reset();
            setShowCurrentPass(false);
            setShowNewPass(false);
            setShowConfirmPass(false);
            setApiError(null);
        }
    }, [open, reset]);

    const onFormSubmit = async (data: PasswordSchemaType) => {
        setApiError(null);
        try {
            const success = await onSave(data.currentPassword, data.newPassword);
            if (success) {
                onClose();
            } else {
                setApiError('Failed to change password. Please check your current password.');
            }
        } catch (err) {
            setApiError('An unexpected error occurred.');
        }
    };

    return (
        <BaseModal
            open={open}
            onClose={onClose}
            title="Edit Password"
            onSubmit={handleSubmit(onFormSubmit)}
            isSubmitting={isSubmitting}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {apiError && (
                    <Typography sx={{ color: PALETTE.text.danger, fontSize: '0.85rem', fontWeight: 500 }}>
                        {apiError}
                    </Typography>
                )}

                <Box>
                    <Typography component="label" sx={{ fontSize: '0.85rem', color: PALETTE.text.secondary, mb: '0.375rem', display: 'block', fontWeight: 500 }}>
                        <Box component="span" sx={{ color: PALETTE.text.danger, mr: '0.125rem' }}>*</Box>Current password
                    </Typography>
                    <TextField
                        {...register('currentPassword')}
                        type={showCurrentPass ? 'text' : 'password'}
                        placeholder="Password"
                        fullWidth
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                                            edge="end"
                                            sx={{ color: PALETTE.text.muted, p: '0.25rem', '&:hover': { color: PALETTE.text.primary } }}
                                        >
                                            {showCurrentPass ? <VisibilityOff sx={{ fontSize: '1.1rem' }} /> : <Visibility sx={{ fontSize: '1.1rem' }} />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                color: PALETTE.text.primary,
                                backgroundColor: '#101114',
                                fontSize: '0.9rem',
                                height: '2.25rem',
                                borderRadius: '0.375rem',
                                '& fieldset': { borderColor: errors.currentPassword ? PALETTE.text.danger : 'rgba(255, 255, 255, 0.15)' },
                                '&:hover fieldset': { borderColor: errors.currentPassword ? PALETTE.text.danger : 'rgba(255, 255, 255, 0.3)' },
                                '&.Mui-focused fieldset': { borderColor: errors.currentPassword ? PALETTE.text.danger : PALETTE.border.focus, borderWidth: '0.0625rem' }
                            }
                        }}
                    />
                    {errors.currentPassword && (
                        <Typography sx={{ color: PALETTE.text.danger, fontSize: '0.8rem', mt: '0.25rem' }}>
                            {errors.currentPassword.message}
                        </Typography>
                    )}
                </Box>

                <Box>
                    <Typography component="label" sx={{ fontSize: '0.85rem', color: PALETTE.text.secondary, mb: '0.375rem', display: 'block', fontWeight: 500 }}>
                        <Box component="span" sx={{ color: PALETTE.text.danger, mr: '0.125rem' }}>*</Box>New password
                    </Typography>
                    <TextField
                        {...register('newPassword')}
                        type={showNewPass ? 'text' : 'password'}
                        placeholder="Password"
                        fullWidth
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowNewPass(!showNewPass)}
                                            edge="end"
                                            sx={{ color: PALETTE.text.muted, p: '0.25rem', '&:hover': { color: PALETTE.text.primary } }}
                                        >
                                            {showNewPass ? <VisibilityOff sx={{ fontSize: '1.1rem' }} /> : <Visibility sx={{ fontSize: '1.1rem' }} />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                color: PALETTE.text.primary,
                                backgroundColor: '#101114',
                                fontSize: '0.9rem',
                                height: '2.25rem',
                                borderRadius: '0.375rem',
                                '& fieldset': { borderColor: errors.newPassword ? PALETTE.text.danger : 'rgba(255, 255, 255, 0.15)' },
                                '&:hover fieldset': { borderColor: errors.newPassword ? PALETTE.text.danger : 'rgba(255, 255, 255, 0.3)' },
                                '&.Mui-focused fieldset': { borderColor: errors.newPassword ? PALETTE.text.danger : PALETTE.border.focus, borderWidth: '0.0625rem' }
                            }
                        }}
                    />
                    {errors.newPassword && (
                        <Typography sx={{ color: PALETTE.text.danger, fontSize: '0.8rem', mt: '0.25rem' }}>
                            {errors.newPassword.message}
                        </Typography>
                    )}
                </Box>

                <Box>
                    <Typography component="label" sx={{ fontSize: '0.85rem', color: PALETTE.text.secondary, mb: '0.375rem', display: 'block', fontWeight: 500 }}>
                        <Box component="span" sx={{ color: PALETTE.text.danger, mr: '0.125rem' }}>*</Box>Confirm new password
                    </Typography>
                    <TextField
                        {...register('confirmPassword')}
                        type={showConfirmPass ? 'text' : 'password'}
                        placeholder="Password"
                        fullWidth
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowConfirmPass(!showConfirmPass)}
                                            edge="end"
                                            sx={{ color: PALETTE.text.muted, p: '0.25rem', '&:hover': { color: PALETTE.text.primary } }}
                                        >
                                            {showConfirmPass ? <VisibilityOff sx={{ fontSize: '1.1rem' }} /> : <Visibility sx={{ fontSize: '1.1rem' }} />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                color: PALETTE.text.primary,
                                backgroundColor: '#101114',
                                fontSize: '0.9rem',
                                height: '2.25rem',
                                borderRadius: '0.375rem',
                                '& fieldset': { borderColor: errors.confirmPassword ? PALETTE.text.danger : 'rgba(255, 255, 255, 0.15)' },
                                '&:hover fieldset': { borderColor: errors.confirmPassword ? PALETTE.text.danger : 'rgba(255, 255, 255, 0.3)' },
                                '&.Mui-focused fieldset': { borderColor: errors.confirmPassword ? PALETTE.text.danger : PALETTE.border.focus, borderWidth: '0.0625rem' }
                            }
                        }}
                    />
                    {errors.confirmPassword && (
                        <Typography sx={{ color: PALETTE.text.danger, fontSize: '0.8rem', mt: '0.25rem' }}>
                            {errors.confirmPassword.message}
                        </Typography>
                    )}
                </Box>
            </Box>
        </BaseModal>
    );
};