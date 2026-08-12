import { Box, Typography } from '@mui/material';

export const HomeBanner = () => (
  <Box sx={(theme) => ({ paddingTop: theme.spacing(5), paddingBottom: theme.spacing(7), paddingLeft: { xs: theme.spacing(3), md: theme.spacing(5) }, paddingRight: { xs: theme.spacing(3), md: theme.spacing(5) } })}>
    <Typography
      component="h1"
      sx={{
        display: 'inline',
        fontSize: { xs: '2rem', md: '3rem' },
        fontWeight: 700,
        color: 'var(--text-h)',
        lineHeight: 1.2,
      }}
    >
      Welcome to{' '}
    </Typography>
    <Typography
      component="span"
      sx={{
        fontSize: { xs: '2rem', md: '3rem' },
        fontWeight: 700,
        lineHeight: 1.2,
        background: 'linear-gradient(to left, #40EBE3, #4A51FF)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      RAGFlow
    </Typography>
  </Box>
);
