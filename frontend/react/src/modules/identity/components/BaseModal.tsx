import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { PALETTE } from '../../../shared/theme/theme';

export interface BaseModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    onSubmit?: (e: React.FormEvent) => void;
    submitLabel?: string;
    cancelLabel?: string;
    isSubmitting?: boolean;
    isDisabled?: boolean;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
}

export const BaseModal: React.FC<BaseModalProps> = ({
    open,
    onClose,
    title,
    children,
    onSubmit,
    submitLabel = 'Save',
    cancelLabel = 'Cancel',
    isSubmitting = false,
    isDisabled = false,
    maxWidth = 'xs'
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth={maxWidth}
            slotProps={{
                backdrop: {
                    sx: {
                        backdropFilter: 'blur(0.0625rem)',
                        backgroundColor: PALETTE.background.backdrop,
                    }
                },
                paper: {
                    sx: {
                        backgroundColor: PALETTE.background.paper || '#141416',
                        backgroundImage: 'none',
                        border: `0.0625rem solid ${PALETTE.border.default}`,
                        borderRadius: '0.5625rem',
                        color: PALETTE.text.primary,
                        padding: '0.625rem 1rem',
                        overflow: 'hidden'
                    }
                }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: '0.5rem', px: '0.75rem' }}>
                <DialogTitle sx={{ fontWeight: 600, fontSize: '1.1rem', p: 0, color: PALETTE.text.primary }}>
                    {title}
                </DialogTitle>
                <IconButton
                    onClick={onClose}
                    disabled={isSubmitting}
                    disableRipple
                    sx={{
                        color: PALETTE.text.muted,
                        p: '0.25rem',
                        '&:hover': { color: PALETTE.text.primary }
                    }}
                >
                    <CloseIcon sx={{ fontSize: '1.2rem' }} />
                </IconButton>
            </Box>

            <Box component={onSubmit ? 'form' : 'div'} onSubmit={onSubmit} noValidate style={{ overflow: 'hidden' }}>
                <DialogContent sx={{ px: '1rem', pt: '0.9375rem', pb: '0.625rem', overflow: 'hidden' }}>
                    {children}
                </DialogContent>

                <DialogActions sx={{ padding: '1.25rem 1rem 0.75rem 1rem', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <Button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        sx={{
                            color: PALETTE.text.primary,
                            textTransform: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            backgroundColor: PALETTE.background.buttonDark || '#222226',
                            border: '0.0625rem solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '0.25rem',
                            px: '1.25rem',
                            py: '0.25rem',
                            '&:hover': { backgroundColor: PALETTE.background.buttonDarkHover || 'rgba(255, 255, 255, 0.12)' }
                        }}
                    >
                        {cancelLabel}
                    </Button>
                    {onSubmit && (
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isDisabled || isSubmitting}
                            sx={{
                                backgroundColor: PALETTE.background.buttonLight || '#ffffff',
                                color: PALETTE.text.inverse || '#000000',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                borderRadius: '0.25rem',
                                px: '1.25rem',
                                py: '0.25rem',
                                '&:hover': { backgroundColor: PALETTE.background.buttonLightHover || '#e4e4e7' }
                            }}
                        >
                            {isSubmitting ? 'Saving...' : submitLabel}
                        </Button>
                    )}
                </DialogActions>
            </Box>
        </Dialog>
    );
};