import { create } from 'zustand';
import type { ApplicationTab } from '../types/home.types';

interface HomeUiState {
  activeTab: ApplicationTab;
  setActiveTab: (tab: ApplicationTab) => void;
}

export const useHomeUiStore = create<HomeUiState>((set) => ({
  activeTab: 'chat',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
