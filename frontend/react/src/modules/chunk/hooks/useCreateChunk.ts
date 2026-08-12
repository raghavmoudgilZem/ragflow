import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';
import { chunkApi } from '../api/chunkApi';
import { chunkKeys } from '../api/chunkKeys';
import { unwrapEnvelope } from '@shared/api/envelope';
import type { Chunk, CreateChunkPayload } from '../types/chunk.types';

export function useCreateChunk(
  options?: Omit<
    UseMutationOptions<Chunk, Error, CreateChunkPayload, unknown>,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: async (payload: CreateChunkPayload) => {
      const res = await chunkApi.createChunk(payload);
      const created = unwrapEnvelope(res.data);
      return {
        ...created,
        enabled: (created as Partial<Chunk>).enabled ?? true,
      } as Chunk;
    },
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: chunkKeys.lists() });
      options?.onSuccess?.(...args);
    },
  });
}
