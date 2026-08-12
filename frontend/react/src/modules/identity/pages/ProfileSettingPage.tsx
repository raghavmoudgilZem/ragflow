import React, { useRef, useState } from 'react';
import { Box, Typography, Button, Snackbar, Alert, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { PALETTE } from '../../../shared/theme/theme';
import { useAuth } from '../hooks/useAuth';
import { EditNameModal } from '../components/EditNameModal';
import { EditTimezoneModal } from '../components/EditTimezoneModal';
import { EditPasswordModal } from '../components/EditPasswordModal';
import { CropImageModal } from '../components/CropImageModal';

interface ProfileRowProps {
    label: string;
    value: string;
    onEdit?: () => void;
    isMasked?: boolean;
}

const ProfileRow: React.FC<ProfileRowProps> = ({ label, value, onEdit, isMasked = false }) => (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography sx={{ width: '10rem', fontSize: '0.9rem', color: PALETTE.text.primary, fontWeight: 500 }}>
            {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
            <Box
                sx={{
                    border: '0.0625rem solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '0.375rem',
                    px: '0.875rem',
                    height: '2.125rem',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: PALETTE.background.input || '#141414',
                    minWidth: '28rem',
                    fontSize: '0.9rem',
                    letterSpacing: isMasked ? '0.125rem' : 'normal',
                    color: PALETTE.text.primary
                }}
            >
                {isMasked ? '********' : value}
            </Box>
            {onEdit && (
                <Button
                    startIcon={<EditIcon sx={{ fontSize: '0.85rem' }} />}
                    onClick={onEdit}
                    sx={{
                        color: PALETTE.text.secondary,
                        backgroundColor: PALETTE.background.buttonDark || '#222226',
                        border: '0.0625rem solid rgba(255, 255, 255, 0.15)',
                        textTransform: 'none',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        borderRadius: '0.375rem',
                        px: '0.875rem',
                        height: '2.125rem',
                        '&:hover': { backgroundColor: PALETTE.background.buttonDarkHover || 'rgba(255, 255, 255, 0.12)' }
                    }}
                >
                    Edit
                </Button>
            )}
        </Box>
    </Box>
);

export const ProfileSettingPage: React.FC = () => {
    const { email, nickname, timeZone, avatarUrl, updateNickname, updateTimezone, updateAvatar, updatePassword } = useAuth();

    const [isNameModalOpen, setIsNameModalOpen] = useState(false);
    const [isTimezoneModalOpen, setIsTimezoneModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    // Avatar cropping modal states
    const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImageSrc(reader.result as string);
            setIsCropModalOpen(true);
        };
        reader.readAsDataURL(file);

        event.target.value = '';
    };

    const handleConfirmCroppedAvatar = async (croppedFile: File) => {
        try {
            const success = await updateAvatar(croppedFile);
            if (success) {
                setShowToast(true);
            }
        } catch (error) {
            console.error('Failed to update cropped avatar:', error);
        }
    };

    const handleDeleteAvatar = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const success = await updateAvatar('');
            if (success) {
                setShowToast(true);
            }
        } catch (error) {
            console.error('Failed to delete avatar:', error);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                width: '100%',
                boxSizing: 'border-box',
                padding: '24px',
                backgroundColor: '#09090b',
            }}
        >
            <Snackbar
                open={showToast}
                autoHideDuration={3000}
                onClose={() => setShowToast(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    icon={<CheckCircleIcon sx={{ color: '#10b981' }} />}
                    sx={{
                        backgroundColor: '#064e3b',
                        color: '#a7f3d0',
                        fontWeight: 300,
                        fontSize: '0.875rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #059669',
                        '& .MuiAlert-icon': { mr: '0.5rem' }
                    }}
                >
                    Modified
                </Alert>
            </Snackbar>

            <Box
                sx={{
                    flexGrow: 1,
                    padding: '32px',
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box',
                    minHeight: 'calc(100vh - 48px)',
                    overflowY: 'auto',
                    background: 'radial-gradient(circle at 50% 190%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 60%), #141416',
                    pointerEvents: 'auto',
                }}
            >
                <Box
                    sx={{
                        borderBottom: '1px solid #27272a',
                        pb: 2,
                        mb: 2,
                        mx: '-32px',
                        px: '32px'
                    }}
                >
                    <Typography variant="h5" sx={{ fontWeight: 600, color: PALETTE.text.primary, fontSize: '1.25rem' }}>
                        Profile
                    </Typography>
                    <Typography variant="body2" sx={{ color: PALETTE.text.secondary, fontSize: '0.875rem' }}>
                        Update your photo and personal details here.
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '56rem' }}>
                    <ProfileRow
                        label="Name"
                        value={nickname}
                        onEdit={() => setIsNameModalOpen(true)}
                    />

                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Typography sx={{ width: '10rem', fontSize: '0.9rem', color: PALETTE.text.primary, pt: '0.5rem', fontWeight: 500 }}>
                            Avatar
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                accept="image/*"
                            />

                            <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                <Box
                                    onClick={() => fileInputRef.current?.click()}
                                    sx={{
                                        border: avatarUrl ? 'none' : '0.0625rem dashed rgba(255, 255, 255, 0.2)',
                                        borderRadius: '0.375rem',
                                        width: '4.25rem',
                                        height: '4.25rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        backgroundColor: PALETTE.background.input || '#27272a',
                                        '&:hover .avatar-hover-overlay': { opacity: 1 },
                                        '&:hover': { borderColor: 'rgba(255, 255, 255, 0.4)' }
                                    }}
                                >
                                    {avatarUrl ? (
                                        <>
                                            <Box
                                                component="img"
                                                src={avatarUrl}
                                                alt="User Avatar"
                                                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            {/* Pencil overlay when hovering uploaded image */}
                                            <Box
                                                className="avatar-hover-overlay"
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    backgroundColor: 'rgba(0, 0, 0, 0.55)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    opacity: 0,
                                                    transition: 'opacity 0.2s ease-in-out',
                                                }}
                                            >
                                                <EditIcon sx={{ color: '#ffffff', fontSize: '1.25rem' }} />
                                            </Box>
                                        </>
                                    ) : (
                                        <>
                                            <AddIcon sx={{ fontSize: '1.2rem', color: PALETTE.text.primary }} />
                                            <Typography sx={{ fontSize: '0.75rem', color: PALETTE.text.primary, mt: '0.125rem' }}>
                                                Upload
                                            </Typography>
                                        </>
                                    )}
                                </Box>

                                {/* Top-right floating X Delete Button */}
                                {avatarUrl && (
                                    <IconButton
                                        onClick={handleDeleteAvatar}
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: '-0.375rem',
                                            right: '-0.375rem',
                                            backgroundColor: '#ffffff',
                                            color: '#000000',
                                            width: '1.125rem',
                                            height: '1.125rem',
                                            p: 0,
                                            zIndex: 2,
                                            boxShadow: '0 0.125rem 0.25rem rgba(0,0,0,0.3)',
                                            '&:hover': { backgroundColor: '#e2e8f0' }
                                        }}
                                    >
                                        <CloseIcon sx={{ fontSize: '0.75rem', fontWeight: 'bold' }} />
                                    </IconButton>
                                )}
                            </Box>

                            <Typography sx={{ fontSize: '0.8rem', color: PALETTE.text.secondary }}>
                                This will be displayed on your profile.
                            </Typography>
                        </Box>
                    </Box>

                    <ProfileRow
                        label="Time zone"
                        value={timeZone}
                        onEdit={() => setIsTimezoneModalOpen(true)}
                    />

                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Typography sx={{ width: '10rem', fontSize: '0.9rem', color: PALETTE.text.primary, pt: '0.25rem', fontWeight: 500 }}>
                            Email
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                            <Typography sx={{ fontSize: '0.9rem', color: PALETTE.text.primary, fontWeight: 500 }}>
                                {email}
                            </Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: PALETTE.text.secondary }}>
                                Once registered, E-mail cannot be changed.
                            </Typography>
                        </Box>
                    </Box>

                    <ProfileRow
                        label="Password"
                        value=""
                        isMasked
                        onEdit={() => setIsPasswordModalOpen(true)}
                    />
                </Box>
            </Box>

            <CropImageModal
                open={isCropModalOpen}
                imageSrc={selectedImageSrc}
                onClose={() => setIsCropModalOpen(false)}
                onConfirm={handleConfirmCroppedAvatar}
            />

            <EditNameModal
                open={isNameModalOpen}
                currentName={nickname}
                onClose={() => setIsNameModalOpen(false)}
                onSave={updateNickname}
            />

            <EditTimezoneModal
                open={isTimezoneModalOpen}
                currentTimezone={timeZone}
                onClose={() => setIsTimezoneModalOpen(false)}
                onSave={updateTimezone}
            />

            <EditPasswordModal
                open={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                onSave={updatePassword}
            />
        </Box>
    );
};

export default ProfileSettingPage;