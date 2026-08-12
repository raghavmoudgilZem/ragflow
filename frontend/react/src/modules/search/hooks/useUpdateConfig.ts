import { useMutation, useQueryClient } from '@tanstack/react-query';
import { searchApi } from '../api/searchApi';
import type { UpdateConfigPayload } from '../types/search.types';
import { useNotificationStore } from '../../../shared/store/useNotificationStore';

export const useUpdateConfig = () => {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((state) => state.showNotification);

  return useMutation({
    mutationFn: (payload: UpdateConfigPayload) => {
      return searchApi.updateConfig(payload);
    },
    onSuccess: (response, variables) => {
      // Invalidate the cache for this specific item using the updated search_id
      queryClient.invalidateQueries({ queryKey: ['searchApp', variables.search_id] });

      // Optional: Clear dashboard list query states if applicable
      queryClient.invalidateQueries({ queryKey: ['searchAppsList'] });
      showNotification('Successfully saved config', 'success');

    },
    onError: (error) => {
      console.error('Configuration patch transaction layout execution error:', error);

      showNotification(error.message || 'Failed to update configuration. Please try again letter', 'error');
    },
  });
};
