import type { ChunkQueryParams } from '../types/chunk.types';

const CHUNK_ROOT = ['chunks'] as const;

export const chunkKeys = {
  all: CHUNK_ROOT,
  lists: () => [...CHUNK_ROOT, 'list'] as const,
  list: (params: ChunkQueryParams) =>
    [...CHUNK_ROOT, 'list', params] as const,
  details: () => [...CHUNK_ROOT, 'detail'] as const,
  detail: (chunkId: string) => [...CHUNK_ROOT, 'detail', chunkId] as const,
};
