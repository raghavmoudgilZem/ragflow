import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import { dataflowKeys } from '../api/dataflowKeys';

const invalidate = (queryClient: QueryClient, queryKey: readonly unknown[]) =>
  queryClient.invalidateQueries({ queryKey });

export const useDataflowInvalidation = () => {
  const queryClient = useQueryClient();

  return useMemo(
    () => ({
      all: () => invalidate(queryClient, dataflowKeys.all),
      overview: (datasetId: string) =>
        invalidate(queryClient, dataflowKeys.overview(datasetId)),
      logs: (datasetId: string) =>
        invalidate(queryClient, dataflowKeys.logs(datasetId)),
      progress: (datasetId: string) =>
        invalidate(queryClient, dataflowKeys.progress(datasetId)),
      documentProgress: (datasetId: string, documentId: string) =>
        invalidate(
          queryClient,
          dataflowKeys.documentProgress(datasetId, documentId),
        ),
      onTerminal: (datasetId: string) =>
        Promise.all([
          invalidate(queryClient, dataflowKeys.overview(datasetId)),
          invalidate(queryClient, dataflowKeys.logs(datasetId)),
        ]),
    }),
    [queryClient],
  );
};
