import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dataflowKeys } from '../api/dataflowKeys';
import { documentService } from '../services/documentService';
import {
  hasRunningDocument,
  pollIntervalForElapsed,
} from '../utils/pollingInterval';
import type { DocumentProgressListParams } from '../types/ingestion.types';

export const useDocumentProgress = (
  datasetId: string | undefined,
  params: DocumentProgressListParams,
) => {
  const resolvedDatasetId = datasetId ?? '';
  const runStartedAtRef = useRef<number | null>(null);

  const query = useQuery({
    queryKey: dataflowKeys.progressList(resolvedDatasetId, params),
    queryFn: () => documentService.listWithProgress(resolvedDatasetId, params),
    enabled: Boolean(datasetId),
    refetchInterval: (activeQuery) => {
      if (!hasRunningDocument(activeQuery.state.data?.docs ?? [])) {
        return false;
      }

      const runStartedAt = runStartedAtRef.current;

      return pollIntervalForElapsed(
        runStartedAt === null ? 0 : Date.now() - runStartedAt,
      );
    },
  });

  const isRunning = hasRunningDocument(query.data?.docs ?? []);

  useEffect(() => {
    runStartedAtRef.current = isRunning ? Date.now() : null;
  }, [isRunning]);

  return query;
};
