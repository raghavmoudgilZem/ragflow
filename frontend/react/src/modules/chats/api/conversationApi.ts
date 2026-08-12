import { apiClient } from '@shared/api/client';
import type {
  ConversationListParams,
  ConversationListResponseData,
  CreateConversationPayload,
  Conversation,
  Message,
} from '../types/conversation.types';
import type { ApiResponse } from '@shared/api/envelope';

export const conversationApi = {
   list: (
    dialogId: string,
    params?: Omit<ConversationListParams, 'dialog_id'>,
  ) =>
    apiClient.get<ApiResponse<ConversationListResponseData>>(
      `/conversation/${dialogId}`,
      { params },
    ),

  get: (conversationId: string) =>
    apiClient.get<ApiResponse<Conversation>>(
      `/chats/conversation/${conversationId}`,
    ),

  create: (payload: CreateConversationPayload) =>
    apiClient.post<ApiResponse<Conversation>>(
      '/conversation',
      payload,
    ),

  addMessage: (conversationId: string, message: Omit<Message, 'id'>) =>
    apiClient.post<ApiResponse<Message>>(
      `/chats/conversation/${conversationId}/message`,
      message,
    ),

  stream: (conversationId: string) =>
    apiClient.get<EventSource>(
      `/chats/conversation/${conversationId}/stream`,
    ),

  delete: (conversationId: string) =>
    apiClient.delete<ApiResponse<{ id: string }>>(
      `/conversation/${conversationId}`,
    ),
};
