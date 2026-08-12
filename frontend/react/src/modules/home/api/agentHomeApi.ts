import { apiClient } from '@shared/api/client';
import type { ApiResponse } from '@shared/api/envelope';
import type { AgentListResponse } from '../types/home.types';

interface AgentListParams {
  page: number;
  page_size: number;
}

export const agentHomeApi = {
  list: (params: AgentListParams) =>
    apiClient.get<ApiResponse<AgentListResponse>>('/canvas/list', { params }),
};
