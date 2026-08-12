import type { AxiosResponse } from 'axios';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { unwrapEnvelope } from '@shared/api/envelope';
import type { ApiResponse } from '@shared/api/envelope';
import { chunkApi } from '../api/chunkApi';
import { chunkKeys } from '../api/chunkKeys';
import type {
  ChunkQueryParams,
  PaginatedChunkResponse,
} from '../types/chunk.types';

export function useChunks(params: ChunkQueryParams, enabled = true) {
  return useQuery<
    AxiosResponse<ApiResponse<PaginatedChunkResponse>>,
    Error,
    PaginatedChunkResponse
  >({
    queryKey: chunkKeys.list(params),
    enabled: enabled && Boolean(params.documentId),
    placeholderData: keepPreviousData,
    staleTime: 5000,
    queryFn: () => chunkApi.getChunks(params),
    select: (response) => unwrapEnvelope(response.data),
  });
}
