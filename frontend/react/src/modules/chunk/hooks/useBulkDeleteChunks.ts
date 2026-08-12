import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';
import { chunkApi } from '../api/chunkApi';
import { chunkKeys } from '../api/chunkKeys';
import { unwrapEnvelope } from '@shared/api/envelope';

export function useBulkDeleteChunks(
  options?: Omit<UseMutationOptions<{ deleted: number }, Error, { chunkIds: string[] }, unknown>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: async ({ chunkIds }) => {
      const res = await chunkApi.bulkDeleteChunks(chunkIds);
      return unwrapEnvelope(res.data);
    },
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: chunkKeys.lists() });
      options?.onSuccess?.(...args);
    },
  });
}
