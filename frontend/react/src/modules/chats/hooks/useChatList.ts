import { useQuery } from '@tanstack/react-query';
import { chatApi } from '../api/chatApi';
import type { ChatListParams } from '../types/chat.types';

// Query key factory — each unique param combo is cached separately.
// Invalidating ['chats', 'list'] wipes all cached pages/searches at once.
export const chatKeys = {
  list: (params: ChatListParams) => ['chats', 'list', params] as const,
};

export const useChatList = (params: ChatListParams) =>
  useQuery({
    queryKey: chatKeys.list(params),
    queryFn:  async () => {
      const res = await chatApi.list(params);
      return res.data.data; // { dialogs: Chat[], total: number }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
