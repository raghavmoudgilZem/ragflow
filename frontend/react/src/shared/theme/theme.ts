import { createTheme } from '@mui/material/styles';

const customPaletteTokens = {
    indigo: '#6366f1',
    cyan: '#06b6d4',
    bgDeep: '#090a0f',
    bgDark: '#13151a',
    bgDarkLight: '#1b1e24',
    bgMuted: '#1c1e24',
    bgMutedLight: '#22252e',
    bgBlack: '#0d0e12',
    bgDarkRed: '#1e1b1b',
    borderMuted: '#3f444e',
    borderRed: '#3f1d1d',
    textWhite: '#f8fafc',
    textLight: '#e2e8f0',
    textMuted: '#94a3b8',
    textMutedDark: '#64748b',
    textMutedDarkest: '#475569',
    errorRed: '#ef4444',
    errorRose: '#f43f5e',
    white: '#ffffff',
}
declare module '@mui/material/styles' {
    interface Palette {
        custom: typeof customPaletteTokens;
    }
    interface PaletteOptions {
        custom?: Partial<typeof customPaletteTokens>
    }
}

export const theme = createTheme({
    palette: {
        background: {
            default: '#1a1a1a',
            paper: '#1e1e1e',
        },
        primary: {
            main: '#00beb4',
            light: '#33ccc4',
            dark: '#00a099',
        },
        secondary: {
            main: '#fff',
        },
        text: {
            primary: '#ffffff',
            secondary: '#a3a3a3',
        },
        divider: '#333',
        error: {
            main: '#ff5252',
        },
        action: {
            disabled: '#888',
            disabledBackground: '#444',
        },
        success: {
            main: '#4caf50',
        },
        custom: customPaletteTokens
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        body2: {
            fontSize: '0.875rem',
            color: '#a3a3a3',
        },
    },
    components: {
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    backgroundColor: '#2a2a2a',
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#444',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#666',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#00beb4',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: ({ theme }) => ({
                    '&.Mui-disabled': {
                        backgroundColor: theme.palette.action.disabledBackground,
                        color: theme.palette.action.disabled,
                    },
                }),
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#1e1e1e',
                    backgroundImage: 'none',
                    border: '1px solid #333',
                },
            },
        },
    },
});

// -------------------------------------------------------------
// Centralized Component Palette Tokens (Added for reuse)
// -------------------------------------------------------------
export const PALETTE = {
    background: {
        paper: '#141416',
        input: 'rgba(255, 255, 255, 0.05)',
        buttonDark: '#222226',
        buttonDarkHover: '#2d2d33',
        buttonLight: '#ffffff',
        buttonLightHover: '#e4e4e7',
        backdrop: 'rgba(255, 255, 255, 0.1)',
    },
    text: {
        primary: theme.palette.text.primary,
        secondary: '#aaaaaa',
        muted: '#71717a',
        danger: '#ef4444',
        inverse: '#000000',
    },
    border: {
        default: 'rgba(255, 255, 255, 0.2)',
        hover: 'rgba(255, 255, 255, 0.4)',
        focus: theme.palette.primary.main,
    }
} as const;

export type AppPalette = typeof PALETTE;