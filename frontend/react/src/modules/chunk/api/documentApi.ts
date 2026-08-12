import type { ApiResponse } from '@shared/api/envelope';
import { chunkApiClient } from './chunkApiClient';
import type { DocumentDetail, ParsedResult } from '../types/chunk.types';

export const documentApi = {
  getDocument: (documentId: string) =>
    chunkApiClient.get<ApiResponse<DocumentDetail>>(`/documents/${documentId}`),

  getParsedResult: (documentId: string) =>
    chunkApiClient.get<ApiResponse<ParsedResult>>(
      `/documents/${documentId}/parsed-result`,
    ),
};
