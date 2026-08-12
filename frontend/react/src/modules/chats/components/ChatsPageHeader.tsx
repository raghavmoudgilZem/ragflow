import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { SlidersHorizontal, Plus } from 'lucide-react';
import { ChatSearchInput } from './ChatSearchInput';
import chatsIcon from '../../../../public/chats_icon.svg';

interface ChatsPageHeaderProps {
  chatCount: number;
  onCreateClick: () => void;
}

export const ChatsPageHeader = ({ chatCount, onCreateClick }: ChatsPageHeaderProps) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Box sx={{ display: 'flex' }}>
      <img src={chatsIcon} alt="Chats Icon" width="32" height="32" className="max-w-full" />
      <Typography variant="h5" sx={{ fontWeight: 600, margin: 0 }}>
        Chat apps
      </Typography>
    </Box>

    {/* Controls — only shown when list has items */}
    {chatCount > 0 && (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton title="Filter" size="small">
          <SlidersHorizontal size={18} />
        </IconButton>

        <ChatSearchInput />

        <Button
          variant="text"
          startIcon={<Plus size={16} />}
          onClick={onCreateClick}
          sx={{
            color: '#000', // You can swap this hex code with '#00beb4' if you want your teal theme
            fontWeight: 500,
            fontSize: '0.875rem',
            background: '#fff',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'rgba(360, 360, 360, 0.8)', // A very faint, semi-transparent background on hover
            }
          }}
        >
          <span>Create chat</span>
        </Button>
      </Box>
    )}
  </Box>
);
