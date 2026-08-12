import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';
import { unwrapEnvelope } from '@shared/api/envelope';
import { chunkApi } from '../api/chunkApi';
import { chunkKeys } from '../api/chunkKeys';

export function useBulkToggleChunksEnabled(
  options?: Omit<UseMutationOptions<{ updated: number }, Error, { chunkIds: string[]; enabled: boolean }, unknown>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: async ({ chunkIds, enabled }) => {
      const res = enabled
        ? await chunkApi.bulkEnableChunks(chunkIds)
        : await chunkApi.bulkDisableChunks(chunkIds);
      return unwrapEnvelope(res.data);
    },
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: chunkKeys.lists() });
      options?.onSuccess?.(...args);
    },
  });
}
