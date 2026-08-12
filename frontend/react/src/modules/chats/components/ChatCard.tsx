import { useState, useMemo } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { MoreVertical } from 'lucide-react';
import { useChatUiStore } from '../store/chatUiStore';
import type { ChatCardProps } from '../types/chat.types';

const pad = (n: number) => n.toString().padStart(2, '0');

const formatDate = (dateValue: string) => {
  const d = new Date(dateValue);

  if (Number.isNaN(d.getTime())) {
    return '-';
  }

  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// Generates a stable gradient based on the first letter of the chat name
const getAvatarGradient = (char: string) => {
  const gradients = [
    'linear-gradient(135deg, #7cb8ff, #3b82f6)', // Blue
    'linear-gradient(135deg, #ffb272, #f97316)', // Orange
    'linear-gradient(135deg, #d398ff, #a855f7)', // Purple
    'linear-gradient(135deg, #ff8a8a, #ef4444)', // Red
    'linear-gradient(135deg, #6ee7b7, #10b981)', // Green
  ];
  // Simple hash to consistently pick a color
  const index = char.charCodeAt(0) % gradients.length;
  return gradients[index];
};

export const ChatCard = ({ chat, onClick, onDelete }: Omit<ChatCardProps, 'onRename'>) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { openRenameModal } = useChatUiStore();

  const openMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };
  const closeMenu = () => setMenuAnchor(null);

  // Memoize the background so it doesn't recalculate on every render
  const avatarBg = useMemo(() => getAvatarGradient(chat.name.charAt(0).toUpperCase()), [chat.name]);

  return (
    <>
      <Card
        onClick={() => onClick(chat.id)}
        sx={(theme) => ({
          cursor: 'pointer',
          backgroundColor: theme.palette.background.paper, 
          border: `1px solid ${theme.palette.divider}`,  
          borderRadius: '10px',
          boxShadow: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: theme.palette.action.hover,   
            borderColor: theme.palette.primary.dark,   
            '& .more-icon': { opacity: 1 }
          }
        })}
      >
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, padding: '16px !important' }}>

          <Avatar
            variant="rounded" // Makes it a rectangle instead of a circle
            sx={{
              background: avatarBg,
              borderRadius: '10px', // High border radius
              width: 40,
              height: 40,
              fontWeight: 600,
              color: '#fff',
              flexShrink: 0
            }}
          >
            {chat.name.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.secondary' }} noWrap>
              {chat.name}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.9rem', opacity: 0.7 }}>
              {formatDate(chat.created_at)}
            </Typography>
          </Box>

          <IconButton
            size="small"
            onClick={openMenu}
            className="more-icon"
            sx={{
              color: 'text.secondary',
              // Keep visible if hovered OR if the menu is actively open
              opacity: menuAnchor ? 1 : 0,
              transition: 'opacity 0.2s ease'
            }}
          >
            <MoreVertical size={20} />
          </IconButton>
        </CardContent>
      </Card>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={() => { closeMenu(); openRenameModal(chat.id, chat.name); }}>
          Rename
        </MenuItem>
        <MenuItem
          onClick={() => { closeMenu(); setDeleteConfirmOpen(true); }}
          sx={{ color: 'error.main' }}
        >
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete chat</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{chat.name}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => { setDeleteConfirmOpen(false); onDelete(chat.id); }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};