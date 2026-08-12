import { Box, Typography } from '@mui/material';
import { Plus } from 'lucide-react';
import type { EmptyStateCardProps } from '../../types/home.types';
import ButtonComponent from '../../../../shared/components/common/ButtonComponent';

export const EmptyStateCard = ({ label, onCreateClick }: EmptyStateCardProps) => (
  <Box
    sx={(theme) => ({
      border: '1.5px dashed rgba(255,255,255,0.18)',
      borderRadius: 2,
      padding: { md: theme.spacing(1.25), lg: theme.spacing(1.5), xl: theme.spacing(1.75) },
      display: 'flex',
      flexDirection: 'column',
      gap: { md: theme.spacing(0.75), lg: theme.spacing(1), xl: theme.spacing(1.25) },
      minHeight: { md: '5.5rem', lg: '6rem', xl: '6.75rem' },
      bgcolor: 'rgba(255,255,255,0.04)',
    })}
  >
    <Typography variant="body2" sx={{ color: 'var(--text)' }}>
      {label}
    </Typography>
    {onCreateClick && (
      <ButtonComponent
        onClick={onCreateClick}
        sx={{
          width: 28,
          height: 28,
          borderRadius: 1,
          border: '1px solid var(--border)',
          color: 'var(--text-h)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s ease',
          '&:hover': {
            borderColor: 'var(--accent-border)',
            color: 'var(--accent)',
          },
        }}
      >
        <Plus size={16} />
      </ButtonComponent>
    )}
  </Box>
);
