import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, CircularProgress } from '@mui/material';
import { PALETTE } from '../../../shared/theme/theme';
interface DeleteConfirmationModalProps {
    open: boolean;
    onClose: () => void;
    targetName: string;
    onConfirm: () => Promise<boolean>;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ open, onClose, targetName, onConfirm }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        setIsSubmitting(true);
        const success = await onConfirm();
        setIsSubmitting(false);

        if (success) {
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
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
            <DialogTitle sx={{ fontWeight: 600, fontSize: '1.1rem', color: PALETTE.text.primary, px: '1rem', pt: '1rem', pb: '0.5rem' }}>
                Remove Team Member
            </DialogTitle>

            <DialogContent sx={{ px: '1rem', py: '0.9375rem' }}>
                <Typography sx={{ color: PALETTE.text.secondary, fontSize: '0.95rem', lineHeight: 1.5 }}>
                    Are you sure you want to remove <strong>{targetName}</strong> from this workspace? This user will immediately lose access to all secure workspace protected systems.
                </Typography>
            </DialogContent>

            <DialogActions sx={{ padding: '1.5rem 1rem 0.75rem 1rem', gap: '0.75rem' }}>
                <Button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
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
                        '&:hover': { backgroundColor: PALETTE.background.buttonDarkHover },
                        '&.Mui-disabled': { opacity: 0.5, color: PALETTE.text.primary }
                    }}
                >
                    Cancel
                </Button>

                <Button
                    type="button"
                    onClick={handleConfirm}
                    variant="contained"
                    disabled={isSubmitting}
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
                        '&:hover': { backgroundColor: PALETTE.background.buttonLightHover },
                        '&.Mui-disabled': { backgroundColor: PALETTE.background.buttonLightHover, opacity: 0.7 }
                    }}
                >
                    {isSubmitting ? <CircularProgress size={16} sx={{ color: PALETTE.text.inverse }} /> : 'Confirm Remove'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteConfirmationModal;