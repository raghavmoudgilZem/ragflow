import { Box, ButtonBase, Typography } from '@mui/material';
import { format } from 'date-fns';
import type { HomeEntryCardProps } from '../../types/home.types';

export const HomeEntryCard = ({ data, icon, onClick }: HomeEntryCardProps) => (
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
        icon
      )}
    </Box>

    {/* Content column: name pinned top, description+date pinned bottom */}
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

      {/* Bottom group: description (optional) + date */}
      <Box sx={(theme) => ({ display: 'flex', flexDirection: 'column', gap: theme.spacing(0.5) })}>
        {data.description && (
          <Typography
            variant="caption"
            sx={{
              color: 'var(--text)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              width: '100%',
            }}
          >
            {data.description}
          </Typography>
        )}
        <Typography
          variant="caption"
          sx={{ color: 'var(--text)', opacity: 0.6 }}
        >
          {format(new Date(data.updatedAt), 'MMM d, yyyy')}
        </Typography>
      </Box>
    </Box>
  </ButtonBase>
);
