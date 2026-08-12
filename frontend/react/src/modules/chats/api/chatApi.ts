import { apiClient } from '@shared/api/client';
import type { ChatListParams, ChatListResponseData, Chat, CreateChatPayload, RenameChatPayload } from '../types/chat.types';
import type { ApiResponse } from '@shared/api/envelope';


export const chatApi = {
  list: (params: ChatListParams) =>
    apiClient.get<ApiResponse<ChatListResponseData>>(
      '/dialog',
      { params }
    ),

  get: (chatId: string) =>
    apiClient.get<ApiResponse<Chat>>(`/dialog/${chatId}`),

  create: (payload: CreateChatPayload) =>
    apiClient.post<ApiResponse<Chat>>('/dialog', payload),

  update: (chatId: string, payload: Partial<RenameChatPayload>) =>
    apiClient.patch<ApiResponse<Chat>>(`/dialog/${chatId}`, payload),

  delete: (chatId: string) =>
    apiClient.delete<ApiResponse<{ id: string }>>(`/dialog/${chatId}`),
};
