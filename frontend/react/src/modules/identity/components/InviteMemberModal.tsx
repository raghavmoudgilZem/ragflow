import React from 'react';
import { useForm } from 'react-hook-form';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    TextField,
    Button,
    IconButton,
    Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { PALETTE } from '../../../shared/theme/theme';

interface InviteMemberModalProps {
    open: boolean;
    onClose: () => void;
    onInviteSubmit: (email: string) => Promise<boolean>;
}

interface FormInputs {
    email: string;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ open, onClose, onInviteSubmit }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInputs>({
        defaultValues: { email: '' }
    });

    const handleClose = () => {
        reset();
        onClose();
    };

    const onSubmit = async (data: FormInputs) => {
        const success = await onInviteSubmit(data.email);
        if (success) {
            handleClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            slotProps={{
                backdrop: {
                    sx: {
                        backdropFilter: 'blur(0.0625rem)',
                        backgroundColor: PALETTE.background.backdrop,
                    }
                },
                paper: {
                    sx: {
                        backgroundColor: PALETTE.background.paper,
                        backgroundImage: 'none',
                        border: `0.0625rem solid ${PALETTE.border.default}`,
                        borderRadius: '0.5625rem',
                        color: PALETTE.text.primary,
                        maxWidth: '42.5rem',
                        padding: '0.625rem 1rem'
                    }
                }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: '0.5rem', px: '0.75rem' }}>
                <DialogTitle sx={{ fontWeight: 600, fontSize: '1.1rem', p: 0 }}>
                    Add
                </DialogTitle>
                <IconButton
                    onClick={handleClose}
                    disableRipple
                    sx={{
                        color: PALETTE.text.muted,
                        p: '0.25rem',
                        '&:hover': {
                            color: PALETTE.text.primary,
                            backgroundColor: 'transparent'
                        }
                    }}
                >
                    <CloseIcon sx={{ fontSize: '1.2rem' }} />
                </IconButton>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <DialogContent sx={{ px: '1rem', pt: '0.9375rem', pb: '0.625rem' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography
                            component="label"
                            sx={{
                                fontSize: '0.85rem',
                                color: PALETTE.text.primary,
                                mb: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                fontWeight: 500
                            }}
                        >
                            <Box component="span" sx={{ color: PALETTE.text.danger, mr: '0.125rem' }}>*</Box>Email
                        </Typography>

                        <TextField
                            placeholder="Email"
                            type="email"
                            fullWidth
                            {...register('email', {
                                required: 'Email field cannot be evaluated as blank',
                                pattern: {
                                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                    message: 'Invalid email'
                                }
                            })}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: PALETTE.text.primary,
                                    backgroundColor: PALETTE.background.input,
                                    fontSize: '0.9rem',
                                    height: '2.0625rem',
                                    borderRadius: '0.375rem',
                                    overflow: 'hidden',
                                    '& fieldset': { borderColor: PALETTE.border.default },
                                    '&:hover fieldset': { borderColor: PALETTE.border.hover },
                                    '&.Mui-focused fieldset': { borderColor: PALETTE.border.focus, borderWidth: '0.0625rem' },
                                    '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
                                        WebkitBoxShadow: '0 0 0 1000px #e8f0fe inset !important',
                                        WebkitTextFillColor: '#000000 !important',
                                        color: '#000000 !important',
                                        caretColor: '#000000',
                                        borderRadius: 'inherit'
                                    }
                                }
                            }}
                        />

                        {errors.email && (
                            <Typography
                                sx={{
                                    color: PALETTE.text.danger,
                                    fontSize: '0.85rem',
                                    mt: '0.375rem',
                                    fontWeight: 400,
                                    display: 'block'
                                }}
                            >
                                {errors.email.message}
                            </Typography>
                        )}
                    </Box>
                </DialogContent>

                <DialogActions sx={{ padding: '1.5rem 1rem 0.75rem 1rem', gap: '0.75rem' }}>
                    <Button
                        onClick={handleClose}
                        sx={{
                            color: PALETTE.text.primary,
                            textTransform: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            backgroundColor: PALETTE.background.buttonDark,
                            borderRadius: '0.25rem',
                            px: '1.25rem',
                            py: '0.25rem',
                            minWidth: '4.6875rem',
                            '&:hover': { backgroundColor: PALETTE.background.buttonDarkHover }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{
                            backgroundColor: PALETTE.background.buttonLight,
                            color: PALETTE.text.inverse,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            borderRadius: '0.25rem',
                            px: '1rem',
                            py: '0.25rem',
                            minWidth: '3.4375rem',
                            '&:hover': { backgroundColor: PALETTE.background.buttonLightHover }
                        }}
                    >
                        Ok
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};