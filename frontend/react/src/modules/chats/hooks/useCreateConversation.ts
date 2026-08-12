import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateConversationPayload } from '../types/conversation.types';
import { conversationApi } from '../api/conversationApi';

export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateConversationPayload) =>
      conversationApi.create(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['conversations', 'list'] }),
  });
};
