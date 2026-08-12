import { type SxProps, type Theme } from '@mui/material';

// --- SearchSkeletonView Styles ---
export const skeletonStyles = {
    container: () => ({
        width: '100%',
        maxWidth: 900,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        mt: 2,
    }),
    summaryWrapper: () => ({
        width: '100%',
    }),
    referencesWrapper: () => ({
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
    }),
    referenceLabelSkeleton: () => ({
        borderRadius: 1,
        bgcolor: 'rgba(255, 255, 255, 0.05)',
        mb: 1,
    }),
    referenceCardsContainer: (theme: Theme): SxProps<Theme> => ({
        display: 'flex',
        gap: 2,
        overflowX: 'auto',
        pb: 2,
        '&::-webkit-scrollbar': { height: '0.4rem' },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.custom?.bgMutedLight ?? '#333333',
            borderRadius: '0.6rem',
        },
    }),
};

// --- RAGChatView Styles ---
export const chatViewStyles = {
    container: () => ({
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        py: 1,
    }),
    topPanel: () => ({
        width: '100%',
    }),
    bottomSegment: () => ({
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
    }),
    referencesTitle: (theme: Theme): SxProps<Theme> => ({
        color: theme.palette.custom?.textMutedDark ?? '#64748b',
        fontWeight: 600,
        fontSize: '0.8rem',
        textTransform: 'uppercase',
        letterSpacing: '0.03rem',
    }),
    referencesList: () => ({
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
    }),
    referenceItem: () => ({
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
    }),
    pillFlag: (theme: Theme): SxProps<Theme> => ({
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        backgroundColor: theme.palette.custom?.bgDarkRed ?? '#4c0519',
        border: '0.0625rem solid',
        borderColor: theme.palette.custom?.borderRed ?? '#f43f5e',
        borderRadius: '0.25rem',
        px: 1.5,
        py: 0.5,
        width: 'fit-content',
    }),
    pillIcon: (theme: Theme): SxProps<Theme> => ({
        fontSize: '0.9rem',
        color: theme.palette.custom?.errorRed ?? '#ff5252',
    }),
    pillLink: (theme: Theme): SxProps<Theme> => ({
        color: theme.palette.custom?.errorRed ?? '#ff5252',
        fontSize: '0.7rem',
        fontWeight: 500,
        cursor: 'pointer',
    }),
    snippetText: (theme: Theme): SxProps<Theme> => ({
        color: theme.palette.custom?.textMuted ?? '#a3a3a3',
        lineHeight: 1.6,
        fontSize: '0.8rem',
        pl: 1,
        borderLeft: '0.1rem solid',
        borderLeftColor: theme.palette.custom?.bgMuted ?? '#444444',
    }),
};

// --- AISummaryView Styles ---
export const summaryStyles = {
    container: (theme: Theme): SxProps<Theme> => ({
        color: theme.palette.custom?.textLight ?? '#e2e8f0',
        py: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
    }),

    innerWrapper: () => ({
        width: '100%',
    }),

    title: (theme: Theme): SxProps<Theme> => ({
        color: theme.palette.custom?.indigo ?? '#4f46e5',
        fontWeight: 600,
        mb: 1,
        letterSpacing: '0.02rem',
        fontSize: '0.7rem',
        textTransform: 'uppercase',
    }),

    // 💡 Accepts both the state logic and the theme context seamlessly
    bodyText: (isStreamActive: boolean, theme: Theme): SxProps<Theme> => ({
        lineHeight: 1.7,
        color: theme.palette.custom?.textLight ?? '#e2e8f0',
        fontSize: '0.9rem',
        whiteSpace: 'pre-wrap',
        '&::after': isStreamActive
            ? {
                content: '"|"',
                animation: 'blink 0.8s infinite',
                color: theme.palette.custom?.cyan ?? '#06b6d4',
                marginLeft: '0.1rem',
            }
            : 'none',
        '@keyframes blink': {
            '50%': { opacity: 0 },
        },
    }),
};
