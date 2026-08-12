import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';

import { useSidebarStore } from '@modules/chats/store/chatSidebarstore';
import { useCreateConversation } from '@modules/chats/hooks/useCreateConversation';
import { useConversationList } from '@modules/chats/hooks/useConversationList';
import { SidebarContent } from './SidebarContent';
import { useQueryClient } from '@tanstack/react-query';

const SIDEBAR_WIDTH = 280;
const COLLAPSED_WIDTH = 64;

const getAvatarGradient = (char: string) => {
    const gradients = [
        'linear-gradient(135deg, #7cb8ff, #3b82f6)', // Blue
        'linear-gradient(135deg, #ffb272, #f97316)', // Orange
        'linear-gradient(135deg, #d398ff, #a855f7)', // Purple
        'linear-gradient(135deg, #ff8a8a, #ef4444)', // Red
        'linear-gradient(135deg, #6ee7b7, #10b981)', // Green
    ];
    const index = char.charCodeAt(0) % gradients.length;
    return gradients[index];
};

interface ChatSidebarProps {
    dialogId: string;
    chatName?: string;
    isMobile: boolean;
    onSelect: (id: string) => void;
}

export const ChatSidebar = ({ dialogId, chatName = 'Chat App', isMobile, onSelect }: ChatSidebarProps) => {
    const queryClient = useQueryClient();
    const { isSidebarOpen, toggleSidebar, collapseSidebar, setActiveConversation } =
        useSidebarStore();

    const [errorOpen, setErrorOpen] = useState(false);
    const createConversation = useCreateConversation();

    const { data } = useConversationList(dialogId);
    const total = data?.pages?.[0]?.meta?.total ?? 0;

    const avatarBg = useMemo(() => getAvatarGradient(chatName.charAt(0).toUpperCase()), [chatName]);

    const handleNewChat = () => {
        const name = `New conversation ${new Date().toLocaleTimeString()}`;
        createConversation.mutate(
            { dialog_id: dialogId, name },
            {
                onSuccess: (res) => {
                    const newConversationId = res?.data?.data?.id;
                    if (newConversationId) {
                        setActiveConversation(newConversationId);
                        queryClient.invalidateQueries({ queryKey: ['conversations', dialogId] });
                    }
                },
                onError: () => setErrorOpen(true),
            },
        );
    };

    if (isMobile) {
        return (
            <>
                {!isSidebarOpen && (
                    <Box sx={{ width: COLLAPSED_WIDTH, position: 'relative', flexShrink: 0 }}>
                        <Box sx={{ pt: 2, display: 'flex', justifyContent: 'center' }}>
                            <IconButton size="small" onClick={toggleSidebar}>
                                <ChevronRight size={20} />
                            </IconButton>
                        </Box>
                    </Box>
                )}

                <Drawer
                    variant="temporary"
                    open={isSidebarOpen}
                    onClose={collapseSidebar}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: SIDEBAR_WIDTH,
                            boxSizing: 'border-box',
                            bgcolor: 'background.paper',
                            backgroundImage: 'none',
                        },
                    }}
                >
                    <SidebarContent
                        chatName={chatName} avatarBg={avatarBg} total={total}
                        onNewChat={handleNewChat} onToggle={toggleSidebar}
                        dialogId={dialogId} onSelect={onSelect}
                    />
                </Drawer>

                <ErrorSnackbar open={errorOpen} onClose={() => setErrorOpen(false)} />
            </>
        );
    }

    return (
        <>
            <Box
                sx={{
                    position: 'relative',
                    width: isSidebarOpen ? SIDEBAR_WIDTH : COLLAPSED_WIDTH,
                    minWidth: isSidebarOpen ? SIDEBAR_WIDTH : COLLAPSED_WIDTH,
                    flexShrink: 0,
                    overflow: 'hidden',
                    transition: 'width 0.25s ease, min-width 0.25s ease',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    bgcolor: 'background.paper',
                }}
            >
                {isSidebarOpen ? (
                    <SidebarContent
                        chatName={chatName} avatarBg={avatarBg} total={total}
                        onNewChat={handleNewChat} onToggle={toggleSidebar}
                        dialogId={dialogId} onSelect={onSelect}
                    />
                ) : (
                    <CollapsedContent onToggle={toggleSidebar} />
                )}
            </Box>

            <ErrorSnackbar open={errorOpen} onClose={() => setErrorOpen(false)} />
        </>
    );
};

const CollapsedContent = ({ onToggle }: { onToggle: () => void }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <IconButton size="small" aria-label="Expand sidebar" onClick={onToggle} sx={{ color: 'text.secondary' }}>
                <ChevronRight size={20} />
            </IconButton>
        </Box>
    </Box>
);

const ErrorSnackbar = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
    <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
        <Alert severity="error" onClose={onClose}>
            Failed to create conversation. Please try again.
        </Alert>
    </Snackbar>
);