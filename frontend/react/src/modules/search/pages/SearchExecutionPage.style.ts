import { type SxProps, type Theme } from '@mui/material';

export const styles = {
    // 💡 Accepts theme explicitly to safely extract custom colors
    pageLayout: (theme: Theme): SxProps<Theme> => ({
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: '100%',
        p: 0,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: theme.palette.custom?.bgDeep ?? '#1a1a1a',
    }),

    mainContentWrapper: (hasSubmitted: boolean): SxProps<Theme> => ({
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: hasSubmitted ? 'flex-start' : 'center',
        p: 4,
        height: '100%',
        transition: 'justify-content 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    }),

    topContainer: (hasSubmitted: boolean): SxProps<Theme> => ({
        width: '100%',
        maxWidth: hasSubmitted ? 900 : 680,
        display: 'flex',
        flexDirection: hasSubmitted ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: hasSubmitted ? 'flex-start' : 'center',
        gap: hasSubmitted ? 3 : 0,
        mb: hasSubmitted ? 4 : 0,
        mt: hasSubmitted ? 2 : 0,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        flex: hasSubmitted ? 0 : 1,
    }),

    brandHeader: (hasSubmitted: boolean, theme: Theme): SxProps<Theme> => ({
        mb: hasSubmitted ? 0 : 4,
        fontSize: hasSubmitted ? '1.5rem' : '3.5rem',
        letterSpacing: '0.03rem',
        fontWeight: 'bold',
        // ✅ Direct usage of theme object variables guarantees runtime resolution
        background: `linear-gradient(90deg, ${theme.palette.custom?.indigo ?? '#4f46e5'} 0%, ${theme.palette.custom?.cyan ?? '#06b6d4'} 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        flexShrink: 0,
    }),

    greetingWrapper: (hasSubmitted: boolean): SxProps<Theme> => ({
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        opacity: hasSubmitted ? 0 : 1,
        flex: hasSubmitted ? 0 : 1,
        transform: hasSubmitted ? 'translateY(-20px)' : 'translateY(0px)',
        visibility: hasSubmitted ? 'hidden' : 'visible',
        overflow: 'hidden',
        transition: 'opacity 0.3s ease, transform 0.3s ease, max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), gap 0.4s',
    }),

    greetingInnerBox: (): SxProps<Theme> => ({
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        textAlign: 'center',
    }),

    greetingWaveText: (theme: Theme): SxProps<Theme> => ({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 1,
        color: theme.palette.custom?.textMuted ?? '#a3a3a3',
    }),

    greetingWelcomeText: (theme: Theme): SxProps<Theme> => ({
        fontWeight: '500',
        color: theme.palette.custom?.textWhite ?? '#ffffff',
    }),

    searchBarPaper: (hasSubmitted: boolean, theme: Theme): SxProps<Theme> => ({
        p: '0.25rem 0.5rem 0.25rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: hasSubmitted ? 680 : 540,
        backgroundColor: hasSubmitted 
            ? (theme.palette.custom?.bgDark ?? '#1e1e1e') 
            : (theme.palette.custom?.bgDeep ?? '#1a1a1a'),
        border: '0.06rem solid',
        borderColor: theme.palette.custom?.bgMutedLight ?? '#333333',
        borderRadius: '3.1rem',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:focus-within': {
            borderColor: theme.palette.custom?.indigo ?? '#4f46e5',
        },
    }),

    searchInput: (theme: Theme): SxProps<Theme> => ({
        ml: 1,
        flex: 1,
        color: theme.palette.custom?.textWhite ?? '#ffffff',
    }),

    searchButton: (theme: Theme): SxProps<Theme> => ({
        p: '0.6rem',
        backgroundColor: theme.palette.custom?.white ?? '#ffffff',
        color: theme.palette.custom?.bgBlack ?? '#000000',
        transition: 'background-color 0.2s ease',
        '&:hover': { 
            backgroundColor: theme.palette.custom?.textLight ?? '#e2e8f0' 
        },
    }),

    chatContainer: (theme: Theme): SxProps<Theme> => ({
        width: '100%',
        maxWidth: 900,
        flex: 1,
        overflowY: 'auto',
        pr: 1,
        mt: 1,
        opacity: 1,
        transform: 'translateY(0)',
        animation: 'fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        '@keyframes fadeInUp': {
            '0%': { opacity: 0, transform: 'translateY(15px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        '&::-webkit-scrollbar': { width: '0.4rem' },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.custom?.bgMuted ?? '#444444',
            borderRadius: '0.6rem',
        },
    }),

    settingsButton: (theme: Theme): SxProps<Theme> => ({
        position: 'absolute',
        right: '0.6rem',
        top: '0.6rem',
        border: '0.06rem solid',
        borderColor: theme.palette.custom?.bgMutedLight ?? '#333333',
        height: '2.5rem',
        width: '3.1rem',
        minWidth: '3.1rem',
        color: theme.palette.custom?.textMuted ?? '#a3a3a3',
        zIndex: 10,
        backgroundColor: theme.palette.custom?.bgDeep ?? '#1a1a1a',
        '&:hover': { 
            borderColor: theme.palette.custom?.indigo ?? '#4f46e5', 
            color: theme.palette.custom?.indigo ?? '#4f46e5' 
        },
    }),
};
