import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateSearchPayload, SearchConfigResponse } from '../types/search.types';
import { searchApi } from '../api/searchApi';

export const useCreateSearchConfig = () => {
  const queryClient = useQueryClient();

  return useMutation<SearchConfigResponse, Error, CreateSearchPayload>({
    mutationFn: async (searchData) => {
      const res = await searchApi.createConfig(searchData);
      // Strip away the shared envelope layer to return clean data to your UI
      return res.data; 
    },
    onSuccess: () => {
      // Proactive cache invalidation can be placed here if needed
      queryClient.invalidateQueries({ queryKey: ['searches'] });
    },
  });
};
