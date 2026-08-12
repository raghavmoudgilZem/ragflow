import { type SxProps, type Theme } from '@mui/material';

export const styles = {
    container: (theme: Theme): SxProps<Theme> => ({
        width: '28.1rem',
        height: '85vh',
        backgroundColor: theme.palette.custom?.bgBlack ?? '#000000',
        borderLeft: '0.06rem solid',
        borderLeftColor: theme.palette.custom?.bgMuted ?? '#444444',
        display: 'flex',
        flexDirection: 'column',
        color: theme.palette.custom?.textWhite ?? '#ffffff',
        marginRight: '4.4rem',
    }),
    headerWrapper: (theme: Theme): SxProps<Theme> => ({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: '1.2rem 1.5rem',
        borderBottom: '0.06rem solid',
        borderBottomColor: theme.palette.custom?.bgMuted ?? '#444444',
    }),
    headerTitle: (theme: Theme): SxProps<Theme> => ({
        fontWeight: 500,
        color: theme.palette.custom?.textLight ?? '#e2e8f0',
        fontSize: '0.9rem',
    }),
    closeButton: (theme: Theme): SxProps<Theme> => ({
        color: theme.palette.custom?.textMutedDark ?? '#64748b',
        '&:hover': { color: theme.palette.custom?.textWhite ?? '#ffffff' },
    }),
    formContent: (theme: Theme): SxProps<Theme> => ({
        flex: 1,
        overflowY: 'auto',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 3.5,
    }),
    fieldGroup: (theme: Theme): SxProps<Theme> => ({
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
    }),
    label: (theme: Theme): SxProps<Theme> => ({
        color: theme.palette.custom?.textMuted ?? '#a3a3a3',
        fontSize: '0.7rem',
    }),
    labelRequired: (theme: Theme): SxProps<Theme> => ({
        color: theme.palette.custom?.errorRose ?? '#f43f5e',
        fontSize: '0.7rem',
    }),
    textInput: (theme: Theme): SxProps<Theme> => ({
        backgroundColor: theme.palette.custom?.bgDark ?? '#1e1e1e',
        borderRadius: '0.4rem',
        '& .MuiOutlinedInput-notchedOutline': { 
            borderColor: theme.palette.custom?.bgMutedLight ?? '#333333' 
        },
        '&:hover .MuiOutlinedInput-notchedOutline': { 
            borderColor: theme.palette.custom?.borderMuted ?? '#475569' 
        },
        '& .Mui-focused .MuiOutlinedInput-notchedOutline': { 
            borderColor: theme.palette.custom?.indigo ?? '#4f46e5' 
        },
        '& .MuiInputBase-input': { 
            color: theme.palette.custom?.textLight ?? '#e2e8f0', 
            fontSize: '0.8rem', 
            py: 1.2 
        },
    }),
    textAreaInput: (theme: Theme): SxProps<Theme> => ({
        '& .MuiInputBase-root': { p: 0 },
        '& .MuiInputBase-input': { 
            color: theme.palette.custom?.textLight ?? '#e2e8f0', 
            fontSize: '0.8rem', 
            p: 1.5 
        },
    }),
    avatarRow: (theme: Theme): SxProps<Theme> => ({
        display: 'flex',
        alignItems: 'center',
        gap: 2,
    }),
    uploadBox: (theme: Theme): SxProps<Theme> => ({
        width: '4rem',
        height: '4rem',
        border: '0.06rem dashed',
        borderColor: theme.palette.custom?.borderMuted ?? '#475569',
        borderRadius: '0.2rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        backgroundColor: theme.palette.custom?.bgDarkLight ?? '#2d2d2d',
        color: theme.palette.custom?.textMuted ?? '#a3a3a3',
        '&:hover': { borderColor: theme.palette.custom?.indigo ?? '#4f46e5' },
    }),
    uploadText: (theme: Theme): SxProps<Theme> => ({
        fontSize: '0.6rem',
        mt: 0.5,
    }),
    uploadHelperText: (theme: Theme): SxProps<Theme> => ({
        color: theme.palette.custom?.textMutedDarkest ?? '#334155',
        fontSize: '0.7rem',
    }),
    selectInput: (theme: Theme): SxProps<Theme> => ({
        backgroundColor: theme.palette.custom?.bgDark ?? '#1e1e1e',
        borderRadius: '0.4rem',
        color: theme.palette.custom?.textMutedDarkest ?? '#334155',
        fontSize: '0.8rem',
        '& .MuiOutlinedInput-notchedOutline': { 
            borderColor: theme.palette.custom?.bgMutedLight ?? '#333333' 
        },
        '&:hover .MuiOutlinedInput-notchedOutline': { 
            borderColor: theme.palette.custom?.borderMuted ?? '#475569' 
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { 
            borderColor: theme.palette.custom?.indigo ?? '#4f46e5' 
        },
        '& .MuiSelect-select': { py: 1.2 },
        '& .MuiSvgIcon-root': { color: theme.palette.custom?.textMutedDarkest ?? '#334155' },
    }),
    footer: (theme: Theme): SxProps<Theme> => ({
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 1.5,
        p: '1.2rem 1.5rem',
        borderTop: '0.06rem solid',
        borderTopColor: theme.palette.custom?.bgMuted ?? '#444444',
        backgroundColor: theme.palette.custom?.bgBlack ?? '#000000',
    }),
    cancelButton: (theme: Theme): SxProps<Theme> => ({
        color: theme.palette.custom?.textMuted ?? '#a3a3a3',
        textTransform: 'none',
        fontSize: '0.8rem',
    }),
    saveButton: (theme: Theme): SxProps<Theme> => ({
        backgroundColor: theme.palette.custom?.white ?? '#ffffff',
        color: theme.palette.custom?.bgBlack ?? '#000000',
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.8rem',
        px: 2.5,
        '&:hover': { backgroundColor: theme.palette.custom?.textLight ?? '#e2e8f0' },
    }),
    descriptionInput: (theme: Theme): SxProps<Theme> => ({
        backgroundColor: theme.palette.custom?.bgDark ?? '#1e1e1e',
        borderRadius: '0.4rem',
        '& .MuiOutlinedInput-notchedOutline': { 
            borderColor: theme.palette.custom?.bgMutedLight ?? '#333333' 
        },
        '&:hover .MuiOutlinedInput-notchedOutline': { 
            borderColor: theme.palette.custom?.borderMuted ?? '#475569' 
        },
        '& .Mui-focused .MuiOutlinedInput-notchedOutline': { 
            borderColor: theme.palette.custom?.indigo ?? '#4f46e5' 
        },
        '& .MuiInputBase-root': { p: 0 },
        '& .MuiInputBase-input': { 
            color: theme.palette.custom?.textLight ?? '#e2e8f0', 
            fontSize: '0.8rem', 
            p: 1.5 
        },
    }),
};
