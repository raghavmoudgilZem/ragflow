import { useQuery } from '@tanstack/react-query';
import { chatHomeApi } from '../api/chatHomeApi';
import type { HomeChat } from '../types/home.types';

const PARAMS = { page: 1, page_size: 10 } as const;

export const useHomeChats = () =>
  useQuery<HomeChat[]>({
    queryKey: ['home', 'chats', PARAMS],
    queryFn: async () => {
      const res = await chatHomeApi.list(PARAMS);
      return res.data.data.dialogs;
    },
  });
