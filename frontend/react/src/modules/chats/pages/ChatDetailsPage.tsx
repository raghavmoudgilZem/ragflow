import { useEffect } from 'react';
import { useParams,useLocation } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { MessageSquareText } from 'lucide-react';
import { ChatSidebar } from '../components/sidebar/ChatSidebar';
import { useSidebarStore } from '../store/chatSidebarstore';

const NoConversationPlaceholder = () => (
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: 2,
            color: 'text.disabled',
        }}
    >
        <MessageSquareText size={48} strokeWidth={1.2} />
        <Typography variant="body1">
            Select a conversation or start a new one
        </Typography>
    </Box>
);

const ConversationViewPlaceholder = ({ conversationId }: { conversationId: string }) => (
    <Box
        sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'text.disabled',
        }}
    >
        <Typography variant="body2">
            Conversation view for <strong>{conversationId}</strong> — coming in RR-332
        </Typography>
    </Box>
);

const ChatDetailsPage = () => {
    const { dialogId } = useParams<{ dialogId: string }>();
    const isMobile = useMediaQuery('(max-width:768px)');
    const location = useLocation();
    const chatName = location.state?.chatName || 'Chat';
    const {
        activeConversationId,
        setActiveConversation,
        collapseSidebar,
    } = useSidebarStore();

    useEffect(() => {
        if (isMobile) collapseSidebar();
    }, [isMobile, collapseSidebar]);

    const handleSelectConversation = (id: string) => {
        setActiveConversation(id);
    };

    if (!dialogId) return null;

    return (
        <Box
            sx={{
                display: 'flex',
                height: '90vh',
                overflow: 'hidden',
                bgcolor: 'background.default',
            }}
        >
            <ChatSidebar
                dialogId={dialogId}
                chatName= {chatName} 
                isMobile={isMobile}
                onSelect={handleSelectConversation}
            />

            <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {activeConversationId
                    ? <ConversationViewPlaceholder conversationId={activeConversationId} />
                    : <NoConversationPlaceholder />
                }
            </Box>
        </Box>
    );
};

export default ChatDetailsPage;