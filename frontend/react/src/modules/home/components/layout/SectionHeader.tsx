import { Box, Typography } from '@mui/material';
import type { SectionHeaderProps } from '../../types/home.types';

export const SectionHeader = ({ label, icon, seeAllHref }: SectionHeaderProps) => (
  <Box
    sx={(theme) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing(2),
    })}
  >
    <Box sx={(theme) => ({ display: 'flex', alignItems: 'center', gap: theme.spacing(1) })}>
      {icon && (
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'var(--text-h)' }}>
          {icon}
        </Box>
      )}
      <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--text-h)' }}>
        {label}
      </Typography>
    </Box>

    {seeAllHref && (
      <Typography
        variant="body2"
        component="a"
        href={seeAllHref}
        sx={{
          color: 'var(--accent)',
          textDecoration: 'none',
          '&:hover': { textDecoration: 'underline' },
        }}
      >
        See all
      </Typography>
    )}
  </Box>
);
