import { useQuery } from '@tanstack/react-query';
import { searchHomeApi } from '../api/searchHomeApi';
import type { HomeSearch } from '../types/home.types';

const PARAMS = { page: 1, page_size: 10 } as const;

export const useHomeSearches = () =>
  useQuery<HomeSearch[]>({
    queryKey: ['home', 'searches', PARAMS],
    queryFn: async () => {
      const res = await searchHomeApi.list(PARAMS);
      return res.data.data.list;
    },
    enabled: false, // Search tab deferred — wire up when Search API is ready
  });
