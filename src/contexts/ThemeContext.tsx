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
  gradient: string[];
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
}

export const THEMES: Record<ThemeId, AppTheme> = {
  purple: {
    id: 'purple',
    label: 'Purple',
    bgPrimary: '#7C3AED',
    gradient: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6'],
    cardBg: 'rgba(255,255,255,0.12)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.75)',
  },
  midnight: {
    id: 'midnight',
    label: 'Midnight',
    bgPrimary: '#1E3A5F',
    gradient: ['#2563EB', '#1E3A5F', '#1e2d5f', '#0f172a'],
    cardBg: 'rgba(255,255,255,0.10)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.70)',
  },
  saffron: {
    id: 'saffron',
    label: 'Saffron',
    bgPrimary: '#D97706',
    gradient: ['#F59E0B', '#D97706', '#B45309', '#92400E'],
    cardBg: 'rgba(255,255,255,0.12)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.75)',
  },
  slate: {
    id: 'slate',
    label: 'Slate',
    bgPrimary: '#334155',
    gradient: ['#475569', '#334155', '#1e293b', '#0f172a'],
    cardBg: 'rgba(255,255,255,0.10)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.70)',
  },
  'high-contrast': {
    id: 'high-contrast',
    label: 'High Contrast',
    bgPrimary: '#000000',
    gradient: ['#1a1a1a', '#000000', '#000000', '#000000'],
    cardBg: 'rgba(255,255,255,0.15)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.90)',
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
