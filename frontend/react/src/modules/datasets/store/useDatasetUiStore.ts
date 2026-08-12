/**
 * @author Shruthi
 * @description Zustand store for Dataset Catalog UI state.
 *              Manages: search, pagination, owner filter, selection, active dialog.
 *              Server data (list, mutations) is owned by React Query.
 */

import { create } from 'zustand';
import { DEFAULT_PAGE_SIZE } from '../constants/dataset.constants';

export type ActiveDialog = 'none' | 'create' | 'delete' | 'edit';

interface DatasetUiState {
  // ── filters ──────────────────────────────────────────
  search: string;
  page: number;
  pageSize: number;
  ownerFilter: string[];

  // ── bulk selection ────────────────────────────────────
  selectedIds: string[];

  // ── dialog control ────────────────────────────────────
  activeDialog: ActiveDialog;
  editingDatasetId: string | null;

  // ── actions ───────────────────────────────────────────
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setOwnerFilter: (owners: string[]) => void;
  toggleSelectedId: (id: string) => void;
  clearSelection: () => void;
  openDialog: (dialog: ActiveDialog, datasetId?: string) => void;
  closeDialog: () => void;
}

export const useDatasetUiStore = create<DatasetUiState>((set) => ({
  search: '',
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  ownerFilter: [],
  selectedIds: [],
  activeDialog: 'none',
  editingDatasetId: null,

  setSearch: (search) => set({ search, page: 1 }),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),
  setOwnerFilter: (ownerFilter) => set({ ownerFilter, page: 1 }),

  toggleSelectedId: (id) =>
    set((s) => ({
      selectedIds: s.selectedIds.includes(id)
        ? s.selectedIds.filter((i) => i !== id)
        : [...s.selectedIds, id],
    })),

  clearSelection: () => set({ selectedIds: [] }),

  openDialog: (activeDialog, datasetId) =>
    set({ activeDialog, editingDatasetId: datasetId ?? null }),

  closeDialog: () =>
    set({ activeDialog: 'none', editingDatasetId: null }),
}));
