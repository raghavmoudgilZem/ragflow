import { apiClient } from '@shared/api/client';
import type { ApiResponse } from '@shared/api/envelope';
import type { DatasetListResponse } from '../types/home.types';

interface DatasetListParams {
  page: number;
  page_size: number;
}

export const datasetHomeApi = {
  list: (params: DatasetListParams) =>
    apiClient.post<ApiResponse<DatasetListResponse>>('/kb/list', params),
};
