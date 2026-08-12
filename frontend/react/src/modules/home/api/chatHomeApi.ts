import { apiClient } from '@shared/api/client';
import type { ApiResponse } from '@shared/api/envelope';
import type { ChatListResponse } from '../types/home.types';

interface ChatListParams {
  page: number;
  page_size: number;
}

export const chatHomeApi = {
  list: (params: ChatListParams) =>
    apiClient.post<ApiResponse<ChatListResponse>>('/chats/dialog/list', params),
};
