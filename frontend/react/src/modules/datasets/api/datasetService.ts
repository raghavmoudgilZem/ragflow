/**
 * @author Shruthi
 * @description Service layer for Dataset API calls.
 *              Mock server returns flat ApiResponse<T> — no adapter needed.
 *              res.data.data.list / res.data.data.total — readable at every level.
 */

import { apiClient } from '../../../shared/api/client';
import type { ApiResponse, PaginatedData } from '../../../shared/api/envelope';
import type {
  IDataset,
  IDatasetListFilters,
  ICreateDatasetPayload,
  IUpdateDatasetPayload,
  IDatasetOwner,
} from '../types/dataset.types';

export const datasetApi = {

  // ── LIST ────────────────────────────────────────────────────────────────
  // POST /v1/kb/list?keywords=&page_size=10&page=1
  // res.data               → ApiResponse<PaginatedData<IDataset>>
  // res.data.data          → PaginatedData { list, total, current_page, page_size }
  // res.data.data.list     → IDataset[]
  // res.data.data.total    → number
  list: (filters: IDatasetListFilters) =>
    apiClient.post<ApiResponse<PaginatedData<IDataset>>>(
      '/v1/dataset/list',
      undefined,
      {
        params: {
          keywords:  filters.search ?? '',
          page:      filters.page,
          page_size: filters.pageSize,
          ...(filters.owners?.length ? { owner_ids: filters.owners } : {}),
        },
      }
    ),

  // ── LIST OWNERS ──────────────────────────────────────────────────────────
  // Derives unique owners from full list — no dedicated endpoint
  listOwners: async (): Promise<IDatasetOwner[]> => {
    const res = await apiClient.post<ApiResponse<PaginatedData<IDataset>>>(
      '/v1/dataset/list',
      undefined,
      { params: { keywords: '', page: 1, page_size: 999 } }
    );
    const list = res.data.data.list;
    const countMap = new Map<string, number>();
    list.forEach((dataset) => {
      countMap.set(
        dataset.owner_name,
        (countMap.get(dataset.owner_name) ?? 0) + 1
      );
    });
    return Array.from(countMap.entries()).map(([email, count]) => ({
      email,
      count,
    }));
  },

  // ── GET BY ID ───────────────────────────────────────────────────────────
  // res.data        → ApiResponse<IDataset>
  // res.data.data   → IDataset
  getById: (id: string) =>
    apiClient.get<ApiResponse<IDataset>>(`/v1/dataset/${id}`),

  // ── CREATE ──────────────────────────────────────────────────────────────
  // res.data        → ApiResponse<IDataset>
  // res.data.data   → newly created IDataset
  create: (payload: ICreateDatasetPayload) =>
    apiClient.post<ApiResponse<IDataset>>('/v1/dataset', payload),

  // ── UPDATE ──────────────────────────────────────────────────────────────
  // res.data        → ApiResponse<IDataset>
  // res.data.data   → updated IDataset
  update: ({ id, ...payload }: IUpdateDatasetPayload) =>
    apiClient.put<ApiResponse<IDataset>>(`/v1/dataset/${id}`, payload),

  // ── DELETE ──────────────────────────────────────────────────────────────
  // res.data        → ApiResponse<{ deleted_ids: string[] }>
  remove: (id: string) =>
    apiClient.delete<ApiResponse<{ deleted_ids: string[] }>>(
      '/v1/dataset',
      { data: { ids: [id] } }
    ),
};