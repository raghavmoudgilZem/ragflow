import Box from '@mui/material/Box';
import { ChatCard } from './ChatCard';
import type { Chat } from '../types/chat.types';

interface ChatCardGridProps {
  chats: Chat[];
  onChatClick: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ChatCardGrid = ({ chats, onChatClick, onDelete }: ChatCardGridProps) => (
  <Box
    sx={{ 
    display: 'grid', 
    gap: 2,
    gridTemplateColumns: {
      xs: 'repeat(1, 1fr)', // 1 card per row on mobile
      sm: 'repeat(2, 1fr)', // 2 cards per row on small tablets
      md: 'repeat(3, 1fr)', // 3 cards per row on tablets
      lg: 'repeat(4, 1fr)', // 4 cards per row on small laptops
      xl: 'repeat(5, 1fr)', // 5 cards per row on large screens
    }
  }}
  >
    {chats.map((chat) => (
      <ChatCard
        key={chat.id}
        chat={chat}
        onClick={onChatClick}
        onDelete={onDelete}
      />
    ))}
  </Box>
);
