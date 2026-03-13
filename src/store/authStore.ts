import { create } from 'zustand';
import type { TunePathUser, ActiveMode } from '@/src/types/models';

interface AuthState {
  user: TunePathUser | null;
  activeMode: ActiveMode;
  selectedInstrumentSlug: string | null;
  selectedLevelSlug: string | null;
  setUser: (user: TunePathUser | null) => void;
  setActiveMode: (mode: ActiveMode) => void;
  setSelectedInstrument: (slug: string) => void;
  setSelectedLevel: (slug: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  activeMode: 'learner',
  selectedInstrumentSlug: null,
  selectedLevelSlug: null,
  setUser: (user) => set({ user }),
  setActiveMode: (mode) => set({ activeMode: mode }),
  setSelectedInstrument: (slug) => set({ selectedInstrumentSlug: slug }),
  setSelectedLevel: (slug) => set({ selectedLevelSlug: slug }),
  clearAuth: () => set({ user: null, activeMode: 'learner', selectedInstrumentSlug: null, selectedLevelSlug: null }),
}));

export type { TunePathUser };
