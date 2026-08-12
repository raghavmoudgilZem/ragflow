import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Plus } from 'lucide-react';
import type { SidebarHeaderProps } from '../../types/conversation.types';

export const SidebarHeader = ({ total, onNewChat }: SidebarHeaderProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      px: 2,
      py: 1.5,
      gap: 1,
      borderBottom: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Typography 
      variant="subtitle2" 
      sx={{ flexGrow: 1, fontWeight: 600 }}
    >
      Conversations
    </Typography>

    <Chip
      label={total}
      size="small"
      sx={{ height: 20, fontSize: 11, fontWeight: 600 }}
    />

    <Tooltip title="New conversation">
      <IconButton size="small" onClick={onNewChat}>
        <Plus size={16} />
      </IconButton>
    </Tooltip>
  </Box>
);
