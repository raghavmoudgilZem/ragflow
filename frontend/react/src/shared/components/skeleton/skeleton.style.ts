import { type SxProps, type Theme } from '@mui/material';

export const styles: {
    paper: SxProps<Theme>;
    box: SxProps<Theme>;
    lastBox: SxProps<Theme>;
    summarybox: SxProps<Theme>
} = {
    paper: {
        p: 2,
        width: { xs: '100%', sm: 300 },
        height: 120,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        borderRadius: 2,
        backgroundColor: '#090a0f',
        borderColor: '#22252e',
        color: 'transparent'
    },
    box:
    {
        borderRadius: 1,
        bgcolor: 'rgba(255, 255, 255, 0.05)',
        '&::after': { bgcolor: 'rgba(255, 255, 255, 0.03)' }
    },
    lastBox: {
        borderRadius: 1,
        bgcolor: 'rgba(255, 255, 255, 0.03)',
        '&::after': { bgcolor: 'rgba(255, 255, 255, 0.02)' }
    },
    summarybox: {
        mb: 1,
        borderRadius: 1,
        bgcolor: 'rgba(255, 255, 255, 0.05)',
        '&::after': { bgcolor: 'rgba(255, 255, 255, 0.03)' }
    }
};
