import { apiClient } from '@shared/api/client';
import { unwrapEnvelope } from '@shared/api/envelope';
import type { ApiResponse } from '@shared/api/envelope';
import type {
  IngestionLogListParams,
  IngestionLogListResponse,
  IngestionSummary,
} from '../types/ingestion.types';

export const ingestionService = {
  getSummary: async (datasetId: string): Promise<IngestionSummary> => {
    const response = await apiClient.get<ApiResponse<IngestionSummary>>(
      `/datasets/${encodeURIComponent(datasetId)}/ingestions/summary`,
    );
    return unwrapEnvelope(response.data);
  },

  listLogs: async (
    datasetId: string,
    params: IngestionLogListParams,
  ): Promise<IngestionLogListResponse> => {
    const response = await apiClient.get<ApiResponse<IngestionLogListResponse>>(
      `/datasets/${encodeURIComponent(datasetId)}/ingestions/logs`,
      { params },
    );
    return unwrapEnvelope(response.data);
  },
};
