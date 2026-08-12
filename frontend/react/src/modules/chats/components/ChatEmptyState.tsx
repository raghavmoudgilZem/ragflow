import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { MessageSquareText, Plus } from 'lucide-react';
import type { ChatEmptyStateProps } from '../types/chat.types';
import { useTheme } from '@mui/material/styles';

export const ChatEmptyState = ({ onCreateClick }: ChatEmptyStateProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 12,
        color: theme.palette.text.secondary,
      }}
    >
      <MessageSquareText size={56} strokeWidth={1.2} />
      <Typography variant="body1">No chat app created yet</Typography>
      <IconButton
        onClick={onCreateClick}
        size="large"
        sx={{
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          '&:hover': { bgcolor: theme.palette.primary.dark },
        }}
      >
        <Plus />
      </IconButton>
    </Box>
  );
};