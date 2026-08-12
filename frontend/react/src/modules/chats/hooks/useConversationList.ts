import { useInfiniteQuery } from '@tanstack/react-query';
import type { ConversationListParams } from '../types/conversation.types';
import { conversationApi } from '../api/conversationApi';

export const conversationKeys = {
  list: (params: ConversationListParams) =>
    ['conversations', 'list', params] as const,
};

export const useConversationList = (
  dialogId: string,
  keywords?: string,
) =>
  useInfiniteQuery({
    queryKey: ['conversations', dialogId, keywords],

    initialPageParam: 1,

    queryFn: async ({ pageParam }) => {
      const res = await conversationApi.list(dialogId, {
        page: pageParam,
        page_size: 10,
        keywords,
      });

      return res.data.data;
    },

    getNextPageParam: (lastPage) => {
      return lastPage.meta.has_more
        ? lastPage.meta.page + 1
        : undefined;
    },

    enabled: Boolean(dialogId),
    staleTime: 2 * 60 * 1000,
  });
