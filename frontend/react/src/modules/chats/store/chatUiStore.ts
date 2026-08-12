import { create } from 'zustand';

interface ChatUiState {
  // Create modal
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;

  // Rename modal
  renameTarget: { id: string; name: string } | null;
  openRenameModal: (id: string, name: string) => void;
  closeRenameModal: () => void;

  // Search
  searchTerm: string;
  setSearchTerm: (term: string) => void;

  // Pagination
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export const useChatUiStore = create<ChatUiState>((set) => ({
  isModalOpen: false,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),

  renameTarget: null,
  openRenameModal: (id, name) => set({ renameTarget: { id, name } }),
  closeRenameModal: () => set({ renameTarget: null }),

  searchTerm: '',
  setSearchTerm: (term) => set({ searchTerm: term, page: 1 }),

  page: 1,
  pageSize: 10,
  setPage: (page) => set({ page }),
  setPageSize: (size) => set({ pageSize: size, page: 1 }),
}));