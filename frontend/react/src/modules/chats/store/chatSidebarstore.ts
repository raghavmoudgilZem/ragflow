import { create } from 'zustand';

interface SidebarState {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    collapseSidebar: () => void; 

    activeConversationId: string | null;
    setActiveConversation: (id: string | null) => void;

    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
    isSidebarOpen: true,
    toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
    collapseSidebar: () => set({ isSidebarOpen: false }),

    activeConversationId: null,
    setActiveConversation: (id) => set({ activeConversationId: id }),

    searchTerm: '',
    setSearchTerm: (term) => set({ searchTerm: term }),
}));
