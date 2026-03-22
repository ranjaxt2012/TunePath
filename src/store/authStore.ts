import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TunePathUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  isVerified: boolean;
}

interface AuthState {
  user: TunePathUser | null;
  selectedTheme: string;
  selectedInstrument: string;
  selectedLevel: string;
  hasOnboarded: boolean;
  tourSeen: boolean;
  trustTier: 'new' | 'trusted' | 'verified';
  isAdmin: boolean;
  uploadCount: number;
  setUser: (user: TunePathUser | null) => void;
  setTheme: (theme: string) => void;
  setSelectedInstrument: (slug: string) => void;
  setSelectedLevel: (slug: string) => void;
  setHasOnboarded: (v: boolean) => void;
  setTourSeen: (v: boolean) => void;
  setTrustTier: (t: 'new' | 'trusted' | 'verified') => void;
  setIsAdmin: (v: boolean) => void;
  setUploadCount: (n: number) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      selectedTheme: 'purple',
      selectedInstrument: '',
      selectedLevel: '',
      hasOnboarded: false,
      tourSeen: false,
      trustTier: 'new',
      isAdmin: false,
      uploadCount: 0,
      setUser: (user) => set({ user }),
      setTheme: (selectedTheme) => set({ selectedTheme }),
      setSelectedInstrument: (slug) => set({ selectedInstrument: slug }),
      setSelectedLevel: (slug) => set({ selectedLevel: slug }),
      setHasOnboarded: (hasOnboarded) => set({ hasOnboarded }),
      setTourSeen: (tourSeen) => set({ tourSeen }),
      setTrustTier: (trustTier) => set({ trustTier }),
      setIsAdmin: (isAdmin) => set({ isAdmin }),
      setUploadCount: (uploadCount) => set({ uploadCount }),
      clearUser: () => set({ user: null, hasOnboarded: false, trustTier: 'new', isAdmin: false, uploadCount: 0 }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export type { TunePathUser };
