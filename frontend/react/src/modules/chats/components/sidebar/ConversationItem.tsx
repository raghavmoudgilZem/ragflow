import { useDeleteConversation } from '@modules/chats/hooks/useDeleteConversation';
import type { ConversationItemProps } from '@modules/chats/types/conversation.types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { MessageSquare } from 'lucide-react';
import { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { MoreVertical, Trash2 } from 'lucide-react';
import { useSidebarStore } from '@modules/chats/store/chatSidebarstore';

const formatTime = (dateInput: string | number | Date) =>
  new Date(dateInput).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const ConversationItem = ({
  conversation, isActive, onClick
}: ConversationItemProps) => {
  const { setActiveConversation, activeConversationId } = useSidebarStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteMutation = useDeleteConversation(conversation.dialog_id);

  const handleMenuOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget as HTMLElement);
  };

  const handleDelete = () => {
      deleteMutation.mutate(conversation.id, {
        onSuccess: () => {
          if (activeConversationId === conversation.id) {
            setActiveConversation(null);
          }
          setConfirmOpen(false);
          setAnchorEl(null);
        }
      });
    };

  return (
    <Box
      onClick={() => onClick(conversation.id)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.5,
        cursor: 'pointer',
        borderRadius: 1,
        bgcolor: isActive ? 'action.selected' : 'transparent',
        borderLeft: '3px solid',
        borderColor: isActive ? 'primary.main' : 'transparent',
        transition: 'background-color 0.15s, border-color 0.15s',
        '&:hover': {
          bgcolor: isActive ? 'action.selected' : 'action.hover',
        },
        '&:hover .delete-btn': {
          opacity: 1,
        },
      }}
    >
      <MessageSquare
        size={20}
        style={{ marginTop: 4, flexShrink: 0, opacity: isActive ? 1 : 0.5 }}
      />

      <Box sx={{ overflow: 'hidden', flexGrow: 1 }}>
        <Typography
          variant="body2"
          noWrap
          sx={{
            fontWeight: isActive ? 600 : 400,
            color: isActive ? 'text.primary' : 'text.secondary'
          }}
        >
          {conversation.name}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          {formatTime(conversation.created_at)}
        </Typography>
      </Box>
      <IconButton
        className="delete-btn"
        size="small"
        onClick={handleMenuOpen}
        sx={{
          opacity: 0,
          transition: 'opacity 0.2s',
          ml: 'auto'
        }}
      >
        <MoreVertical size={16} />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => { setConfirmOpen(true); setAnchorEl(null); }} sx={{ color: 'error.main' }}>
          <Trash2 size={16} style={{ marginRight: 8 }} /> Delete
        </MenuItem>
      </Menu>

      <Dialog maxWidth="xl" open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Are you sure to delete it ?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
};
