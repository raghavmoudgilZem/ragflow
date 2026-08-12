import { create } from 'zustand';
import type { UserSession } from '../types/identity.types';

interface IdentityState {
  session: UserSession | null;
  setSession: (session: UserSession | null) => void;
  logout: () => void;
}

const getStoredProfileName = (): string => {
  try {
    const cached = sessionStorage.getItem('userProfile');
    if (cached) {
      const parsed = JSON.parse(cached);
      return parsed.nickname || parsed.name || 'User';
    }
  } catch (e) {
    console.error("Failed to parse 'userProfile' from storage; falling back to 'User'.", e);
  }
  return 'User';
};

export const useIdentity = create<IdentityState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  logout: () => set({ session: null }),
}));