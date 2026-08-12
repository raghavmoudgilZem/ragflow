import { apiClient } from '@shared/api/client';
import type { ApiResponse } from '@shared/api/envelope';
import type { SearchListResponse } from '../types/home.types';

interface SearchListParams {
  page: number;
  page_size: number;
}

export const searchHomeApi = {
  list: (params: SearchListParams) =>
    apiClient.post<ApiResponse<SearchListResponse>>('/search/list', params),
};
