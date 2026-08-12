import { useMutation, useQueryClient } from '@tanstack/react-query';
import { searchApi } from '../api/searchApi';

export const useDeleteSearch = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const res = await searchApi.deleteConfig(id);
      return res.data.data;
    },
    onSuccess: () => {
      // Instantly invalidate the grid list cache to trigger a seamless layout refresh [2]
      queryClient.invalidateQueries({ queryKey: ['searches'] });
    },
    onError: (error) => {
      console.error('Failed to delete search application:', error.message);
    },
  });
};
