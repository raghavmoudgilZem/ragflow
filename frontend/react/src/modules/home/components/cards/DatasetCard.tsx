import { Box, ButtonBase, /* Chip, */ Typography } from '@mui/material';
import { Library } from 'lucide-react';
import { format } from 'date-fns';
import type { DatasetCardProps } from '../../types/home.types';

export const DatasetCard = ({ data, onClick }: DatasetCardProps) => (
  <ButtonBase
    onClick={onClick}
    sx={(theme) => ({
      width: '100%',
      height: '100%',
      textAlign: 'left',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 2,
      padding: { md: theme.spacing(1.25), lg: theme.spacing(1.5), xl: theme.spacing(1.75) },
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: theme.spacing(1),
      minHeight: { md: '5.5rem', lg: '6rem', xl: '6.75rem' },
      bgcolor: 'rgba(255,255,255,0.05)',
      transition: 'all 0.15s ease',
      '&:hover': {
        borderColor: 'var(--accent-border)',
      },
    })}
  >
    {/* Avatar */}
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: 1,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(255,255,255,0.08)',
        flexShrink: 0,
        color: 'var(--text)',
      }}
    >
      {data.avatar ? (
        <Box
          component="img"
          src={data.avatar}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <Library size={16} />
      )}
    </Box>

    {/* Content column: name pinned top, stats+footer pinned bottom */}
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flex: 1,
        width: '100%',
        minWidth: 0,
      }}
    >
      {/* Top: name */}
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: 'var(--text-h)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
        }}
      >
        {data.name}
      </Typography>

      {/* Bottom group: docs row + date/chip footer */}
      <Box sx={(theme) => ({ display: 'flex', flexDirection: 'column', gap: theme.spacing(0.5) })}>
        <Box sx={(theme) => ({ display: 'flex', gap: theme.spacing(1.5) })}>
          <Typography variant="caption" sx={{ color: 'var(--text)' }}>
            {data.doc_num} docs
          </Typography>
          <Typography variant="caption" sx={{ color: 'var(--text)', opacity: 0.5 }}>
            ·
          </Typography>
          <Typography variant="caption" sx={{ color: 'var(--text)' }}>
            {data.chunk_num} chunks
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Typography variant="caption" sx={{ color: 'var(--text)', opacity: 0.6 }}>
            {format(new Date(data.update_time), 'MMM d, yyyy')}
          </Typography>
          {/* FUTURE: Creator badge — show dataset.nickname when it differs from
              session.nickname (shared dataset). Hide when it's the logged-in user's
              own dataset. Requires UserSession.nickname + HomeDataset.nickname to be
              added once the identity/login module is wired up.
          <Chip
            label={data.permission === 'team' ? 'Team' : 'Me'}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.65rem',
              bgcolor: data.permission === 'team' ? 'var(--accent-bg)' : 'rgba(255,255,255,0.08)',
              color: data.permission === 'team' ? 'var(--accent)' : 'var(--text)',
              border: 'none',
            }}
          /> */}
        </Box>
      </Box>
    </Box>
  </ButtonBase>
);
