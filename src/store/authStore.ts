import { create } from 'zustand';
import type { TunePathUser, ActiveMode } from '@/src/types/models';

interface AuthState {
  user: TunePathUser | null;
  activeMode: ActiveMode;
  selectedInstrumentSlug: string | null;
  selectedLevelSlug: string | null;
  selectedGenres: string[];
  selectedTheme: string;
  hasOnboarded: boolean;
  trustTier: 'new' | 'trusted' | 'verified';
  uploadCount: number;
  isAdmin: boolean;
  tourSeen: boolean;
  setUser: (user: TunePathUser | null) => void;
  setActiveMode: (mode: ActiveMode) => void;
  setSelectedInstrument: (slug: string) => void;
  setSelectedLevel: (slug: string) => void;
  setGenres: (genres: string[]) => void;
  setTheme: (theme: string) => void;
  setHasOnboarded: (v: boolean) => void;
  setTrustTier: (t: 'new' | 'trusted' | 'verified') => void;
  setUploadCount: (n: number) => void;
  setIsAdmin: (v: boolean) => void;
  setTourSeen: (v: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  activeMode: 'learner',
  selectedInstrumentSlug: null,
  selectedLevelSlug: null,
  selectedGenres: [],
  selectedTheme: 'purple',
  hasOnboarded: false,
  trustTier: 'new',
  uploadCount: 0,
  isAdmin: false,
  tourSeen: false,
  setUser: (user) => set({ user }),
  setActiveMode: (mode) => set({ activeMode: mode }),
  setSelectedInstrument: (slug) => set({ selectedInstrumentSlug: slug }),
  setSelectedLevel: (slug) => set({ selectedLevelSlug: slug }),
  setGenres: (genres) => set({ selectedGenres: genres }),
  setTheme: (theme) => set({ selectedTheme: theme }),
  setHasOnboarded: (v) => set({ hasOnboarded: v }),
  setTrustTier: (t) => set({ trustTier: t }),
  setUploadCount: (n) => set({ uploadCount: n }),
  setIsAdmin: (v) => set({ isAdmin: v }),
  setTourSeen: (v) => set({ tourSeen: v }),
  clearAuth: () => set({
    user: null,
    activeMode: 'learner',
    selectedInstrumentSlug: null,
    selectedLevelSlug: null,
    selectedGenres: [],
    selectedTheme: 'purple',
  }),
}));

export type { TunePathUser };
