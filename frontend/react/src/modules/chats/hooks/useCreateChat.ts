import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../api/chatApi';
import type { CreateChatPayload } from '../types/chat.types';

export const useCreateChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateChatPayload) => chatApi.create(payload),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['chats', 'list'] }),
  });
};
