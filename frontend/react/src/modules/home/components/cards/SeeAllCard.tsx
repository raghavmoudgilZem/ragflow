import { Box, ButtonBase, Typography } from '@mui/material';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SeeAllCardProps {
  href: string;
}

export const SeeAllCard = ({ href }: SeeAllCardProps) => {
  const navigate = useNavigate();

  return (
    <ButtonBase
      onClick={() => navigate(href)}
      sx={(theme) => ({
        width: '100%',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 2,
        padding: { md: theme.spacing(1.25), lg: theme.spacing(1.5), xl: theme.spacing(1.75) },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing(0.5),
        color: 'var(--text)',
        minHeight: { md: '5.5rem', lg: '6rem', xl: '6.75rem' },
        bgcolor: 'rgba(255,255,255,0.05)',
        transition: 'all 0.15s ease',
        '&:hover': {
          borderColor: 'var(--accent-border)',
          color: 'var(--text-h)',
        },
      })}
    >
      <Typography variant="body2" component="span">
        See all
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <ChevronRight size={16} />
      </Box>
    </ButtonBase>
  );
};
