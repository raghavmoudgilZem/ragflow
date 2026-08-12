import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../api/chatApi';

export const useRenameChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Destructure the single object passed from ChatsPage.tsx
    // and feed it into the two arguments of chatApi.update
    mutationFn: ({ dialog_id, name }: { dialog_id: string; name: string }) =>
      chatApi.update(dialog_id, { name }),
    onSuccess: () => {
      // Invalidate the list to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['chats', 'list'] });
    },
  });
};