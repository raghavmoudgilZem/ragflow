import { useQuery } from '@tanstack/react-query';
import { agentHomeApi } from '../api/agentHomeApi';
import type { HomeAgent } from '../types/home.types';

const PARAMS = { page: 1, page_size: 10 } as const;

export const useHomeAgents = () =>
  useQuery<HomeAgent[]>({
    queryKey: ['home', 'agents', PARAMS],
    queryFn: async () => {
      const res = await agentHomeApi.list(PARAMS);
      return res.data.data.list;
    },
  });
