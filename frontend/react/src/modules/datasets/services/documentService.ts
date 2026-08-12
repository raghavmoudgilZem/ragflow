import { apiClient } from '@shared/api/client';
import { unwrapEnvelope } from '@shared/api/envelope';
import type { ApiResponse } from '@shared/api/envelope';
import type {
  DocumentProgressListParams,
  DocumentProgressListResponse,
} from '../types/ingestion.types';

export const documentService = {
  listWithProgress: async (
    datasetId: string,
    params: DocumentProgressListParams,
  ): Promise<DocumentProgressListResponse> => {
    const response = await apiClient.get<
      ApiResponse<DocumentProgressListResponse>
    >(`/datasets/${encodeURIComponent(datasetId)}/documents`, { params });
    return unwrapEnvelope(response.data);
  },
};
