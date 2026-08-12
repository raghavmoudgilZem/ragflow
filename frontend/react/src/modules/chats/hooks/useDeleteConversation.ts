import { useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationApi } from '../api/conversationApi';

export const useDeleteConversation = (dialogId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => conversationApi.delete(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'conversations' && query.queryKey[1] === dialogId
      });
    },
  });
};