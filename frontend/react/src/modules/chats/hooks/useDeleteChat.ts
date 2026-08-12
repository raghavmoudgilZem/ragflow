import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../api/chatApi';

export const useDeleteChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Accept a string ID directly
    mutationFn: (dialog_id: string) => chatApi.delete(dialog_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats', 'list'] });
    },
  });
};