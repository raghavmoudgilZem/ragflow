// src/modules/search/hooks/useSearchApps.ts
import { useQuery } from '@tanstack/react-query';
import { searchApi } from '../api/searchApi';
import type { SearchAppItem } from '../types/search.types';

export const useGetSearchApp = (id: string) => {
  return useQuery<SearchAppItem, Error>({
    // Keeps cache unique per target item ID
    queryKey: ['searches', id],
    
    // Use the outer scope `id` directly inside your callback function
    queryFn: async (): Promise<SearchAppItem> => {
      const res = await searchApi.getConfigById(id);
      
      if (!res?.data) {
        throw new Error('No search configuration details found.');
      }
      
      return res.data;
    },
    
    staleTime: 5000, 
    // Added enabled option so it doesn't fire a broken network request if the ID is missing/blank
    enabled: !!id, 
  });
};
