import { useMutation, useQueryClient } from '@tanstack/react-query';
import { unwrapEnvelope } from '@shared/api/envelope';
import { chunkApi } from '../api/chunkApi';
import { chunkKeys } from '../api/chunkKeys';
import type { Chunk } from '../types/chunk.types';

export function useToggleChunkEnabled() {
  const queryClient = useQueryClient();

  return useMutation<Chunk, Error, { chunkId: string; enabled: boolean }>({
    mutationFn: async ({
      chunkId,
      enabled,
    }: {
      chunkId: string;
      enabled: boolean;
    }) => {
      const res = await chunkApi.patchChunk(chunkId, { enabled });
      return unwrapEnvelope(res.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chunkKeys.lists() });
    },
  });
}
