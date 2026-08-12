/**
 * @author Shruthi
 * @description Orchestration hook for the Dataset Catalog page.
 *              Composes all query + mutation hooks and reads filter state from Zustand.
 *              Page component stays free of business logic — it only calls this hook.
 */

import { useDatasetUiStore } from '../store/useDatasetUiStore';
import { useDatasetList } from './queries/useDatasetList';
import { useCreateDataset } from './queries/useCreateDataset';
import { useUpdateDataset } from './queries/useUpdateDataset';
import { useDeleteDataset } from './queries/useDeleteDataset';
import type { ICreateDatasetPayload, IUpdateDatasetPayload } from '../types/dataset.types';
import { useMemo } from 'react';

interface UseDatasetCatalogProps {
  search: string;
}

export const useDatasetCatalog = ({
  search,
}: UseDatasetCatalogProps) => {
  const page = useDatasetUiStore((state) => state.page);
  const pageSize = useDatasetUiStore((state) => state.pageSize);
  const ownerFilter = useDatasetUiStore((state) => state.ownerFilter);

  const filters = useMemo(
    () => ({
        search,
        page,
        pageSize,
        owners: ownerFilter,
    }),
    [search, page, pageSize, ownerFilter]
  );

  const listQuery      = useDatasetList(filters);
  const createMutation = useCreateDataset();
  const updateMutation = useUpdateDataset();
  const deleteMutation = useDeleteDataset();

  const createDataset = async (payload: ICreateDatasetPayload) => {
    await createMutation.mutateAsync(payload);
  };

  const updateDataset = async (payload: IUpdateDatasetPayload) => {
    await updateMutation.mutateAsync(payload);
  };

  const deleteDataset = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  return {
    // ── list state ────────────────────────────────────
    datasets:  listQuery.data?.list ?? [],
    total:     listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    isError:   listQuery.isError,
    refetch:   listQuery.refetch,

    // ── mutations ─────────────────────────────────────
    createDataset,
    updateDataset,
    deleteDataset,

    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
};