import type { ApiResponse } from '@shared/api/envelope';
import { chunkApiClient } from './chunkApiClient';
import type {
  Chunk,
  ChunkQueryParams,
  CreateChunkPayload,
  PaginatedChunkResponse,
  UpdateChunkPayload,
} from '../types/chunk.types';

interface BulkEnabledResponse {
  updated: number;
}

interface BulkDeleteResponse {
  deleted: number;
}

export const chunkApi = {
  getChunks: (params: ChunkQueryParams) =>
    chunkApiClient.get<ApiResponse<PaginatedChunkResponse>>('/chunks', {
      params: {
        documentId: params.documentId,
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
        enabled: params.enabled,
      },
    }),

  createChunk: (payload: CreateChunkPayload) =>
    chunkApiClient.post<ApiResponse<Chunk>>('/chunks', payload),

  updateChunk: (chunkId: string, payload: UpdateChunkPayload) =>
    chunkApiClient.put<ApiResponse<Chunk>>(`/chunks/${chunkId}`, payload),

  deleteChunk: (chunkId: string) =>
    chunkApiClient.delete<ApiResponse<null>>(`/chunks/${chunkId}`),

  patchChunk: (chunkId: string, payload: Partial<UpdateChunkPayload>) =>
    chunkApiClient.patch<ApiResponse<Chunk>>(`/chunks/${chunkId}`, payload),

  bulkEnableChunks: (chunkIds: string[]) =>
    chunkApiClient.post<ApiResponse<BulkEnabledResponse>>(
      '/chunks/bulk-enable',
      { chunkIds },
    ),

  bulkDisableChunks: (chunkIds: string[]) =>
    chunkApiClient.post<ApiResponse<BulkEnabledResponse>>(
      '/chunks/bulk-disable',
      { chunkIds },
    ),

  bulkDeleteChunks: (chunkIds: string[]) =>
    chunkApiClient.post<ApiResponse<BulkDeleteResponse>>(
      '/chunks/bulk-delete',
      { chunkIds },
    ),
};
