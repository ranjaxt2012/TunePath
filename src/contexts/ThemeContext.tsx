import React, { createContext, useCallback, useContext } from 'react';
import { useAuthStore } from '@/src/store/authStore';
import { patchPreferences } from '@/src/services/apiClient';

export type ThemeId =
  | 'purple'
  | 'midnight'
  | 'saffron'
  | 'slate'
  | 'high-contrast';

export interface AppTheme {
  id: ThemeId;
  label: string;
  bgPrimary: string;
  bgSecondary: string;
  gradient: string[];
  cardBg: string;
  cardBgHover: string;
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  borderColor: string;
  borderColorStrong: string;
  modalBg: string;
  overlayBg: string;
  error: string;
  success: string;
}

export const THEMES: Record<ThemeId, AppTheme> = {
  purple: {
    id: 'purple',
    label: 'Purple',
    bgPrimary: '#7C3AED',
    bgSecondary: '#6D28D9',
    gradient: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6'],
    cardBg: 'rgba(255,255,255,0.12)',
    cardBgHover: 'rgba(255,255,255,0.18)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.75)',
    textDisabled: 'rgba(255,255,255,0.35)',
    borderColor: 'rgba(255,255,255,0.15)',
    borderColorStrong: 'rgba(255,255,255,0.40)',
    modalBg: '#2D1B69',
    overlayBg: 'rgba(0,0,0,0.6)',
    error: '#EF4444',
    success: '#10B981',
  },
  midnight: {
    id: 'midnight',
    label: 'Midnight',
    bgPrimary: '#1E3A5F',
    bgSecondary: '#1e2d5f',
    gradient: ['#2563EB', '#1E3A5F', '#1e2d5f', '#0f172a'],
    cardBg: 'rgba(255,255,255,0.10)',
    cardBgHover: 'rgba(255,255,255,0.16)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.70)',
    textDisabled: 'rgba(255,255,255,0.30)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderColorStrong: 'rgba(255,255,255,0.35)',
    modalBg: '#0f2040',
    overlayBg: 'rgba(0,0,0,0.7)',
    error: '#EF4444',
    success: '#10B981',
  },
  saffron: {
    id: 'saffron',
    label: 'Saffron',
    bgPrimary: '#D97706',
    bgSecondary: '#B45309',
    gradient: ['#F59E0B', '#D97706', '#B45309', '#92400E'],
    cardBg: 'rgba(255,255,255,0.12)',
    cardBgHover: 'rgba(255,255,255,0.18)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.75)',
    textDisabled: 'rgba(255,255,255,0.35)',
    borderColor: 'rgba(255,255,255,0.15)',
    borderColorStrong: 'rgba(255,255,255,0.40)',
    modalBg: '#7C3500',
    overlayBg: 'rgba(0,0,0,0.6)',
    error: '#EF4444',
    success: '#10B981',
  },
  slate: {
    id: 'slate',
    label: 'Slate',
    bgPrimary: '#334155',
    bgSecondary: '#1e293b',
    gradient: ['#475569', '#334155', '#1e293b', '#0f172a'],
    cardBg: 'rgba(255,255,255,0.10)',
    cardBgHover: 'rgba(255,255,255,0.16)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.70)',
    textDisabled: 'rgba(255,255,255,0.30)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderColorStrong: 'rgba(255,255,255,0.35)',
    modalBg: '#1e293b',
    overlayBg: 'rgba(0,0,0,0.7)',
    error: '#EF4444',
    success: '#10B981',
  },
  'high-contrast': {
    id: 'high-contrast',
    label: 'High Contrast',
    bgPrimary: '#000000',
    bgSecondary: '#1a1a1a',
    gradient: ['#1a1a1a', '#000000', '#000000', '#000000'],
    cardBg: 'rgba(255,255,255,0.15)',
    cardBgHover: 'rgba(255,255,255,0.25)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.90)',
    textDisabled: 'rgba(255,255,255,0.50)',
    borderColor: 'rgba(255,255,255,0.30)',
    borderColorStrong: 'rgba(255,255,255,0.70)',
    modalBg: '#111111',
    overlayBg: 'rgba(0,0,0,0.8)',
    error: '#FF6B6B',
    success: '#51CF66',
  },
};

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: THEMES.purple,
  setTheme: () => {},
});

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const selectedTheme = (useAuthStore(
    (s) => s.selectedTheme
  ) ?? 'purple') as ThemeId;

  const theme = THEMES[selectedTheme] ?? THEMES.purple;

  const setTheme = useCallback(async (id: ThemeId) => {
    useAuthStore.getState().setTheme(id);
    try {
      await patchPreferences({
        preferred_theme: id,
        preferred_genres: useAuthStore.getState().selectedGenres || [],
      });
    } catch (e) {
      console.error('Theme save failed:', e);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
