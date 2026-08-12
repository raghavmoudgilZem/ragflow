// src/modules/search/hooks/useSearchApps.ts
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { searchApi } from '../api/searchApi';
import type { SearchAppsQueryParams, PaginatedSearchResponse } from '../types/search.types';

export const useSearchApps = (params: SearchAppsQueryParams) => {
  return useQuery<PaginatedSearchResponse, Error>({
    queryKey: ['searches', params],
    
    queryFn: async () => {
      const res = await searchApi.getAllConfigs(params);
      
      // FIX: Ensure undefined is intercepted and converted to a safe fallback
      if (!res?.data) {
        return {
          items: [],       // Fallback empty list so your .map statements don't crash
          total_count: 0, // Enforce standard paginator shapes
          page: params.page,
          page_size: params.pageSize,
        } as unknown as PaginatedSearchResponse; 
      }
      
      return res.data;
    },
    
    placeholderData: keepPreviousData, 
    staleTime: 5000, 
  });
};
