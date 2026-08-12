import type { SidebarContentProps } from "@modules/chats/types/conversation.types";
import { ChevronLeft } from "lucide-react";
import { ConversationList } from "./ConversationList";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarSearch } from "./SidebarSearch";
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

export const SidebarContent = ({ chatName, avatarBg, total, onNewChat, onToggle, dialogId, onSelect }: SidebarContentProps) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Avatar variant="rounded" sx={{ width: 32, height: 32, background: avatarBg, borderRadius: '8px', fontSize: 14, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                {chatName.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="subtitle1" noWrap sx={{ flexGrow: 1, fontWeight: 600 }}>{chatName}</Typography>
            <IconButton size="small" aria-label="Collapse sidebar" onClick={onToggle} sx={{ color: 'text.secondary' }}>
                <ChevronLeft size={20} />
            </IconButton>
        </Box>
        <SidebarHeader total={total} onNewChat={onNewChat} />
        <Box sx={{ px: 0, py: 1.5 }}><SidebarSearch /></Box>
        <ConversationList dialogId={dialogId} onSelect={onSelect} />
    </Box>
);