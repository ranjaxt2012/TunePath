import React, { createContext, useCallback, useContext } from 'react';
import { useAuthStore } from '@/src/store/authStore';
import { patchPreferences } from '@/src/services/apiClient';

export type ThemeId =
  | 'purple'
  | 'ocean'
  | 'forest'
  | 'rose'
  | 'saffron'
  | 'midnight'
  | 'custom';

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
  ocean: {
    id: 'ocean',
    label: 'Ocean',
    bgPrimary: '#0EA5E9',
    bgSecondary: '#0284C7',
    gradient: ['#38BDF8', '#0EA5E9', '#0284C7', '#075985'],
    cardBg: 'rgba(255,255,255,0.12)',
    cardBgHover: 'rgba(255,255,255,0.18)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.75)',
    textDisabled: 'rgba(255,255,255,0.35)',
    borderColor: 'rgba(255,255,255,0.15)',
    borderColorStrong: 'rgba(255,255,255,0.40)',
    modalBg: '#0c4a6e',
    overlayBg: 'rgba(0,0,0,0.6)',
    error: '#EF4444',
    success: '#10B981',
  },
  forest: {
    id: 'forest',
    label: 'Forest',
    bgPrimary: '#16A34A',
    bgSecondary: '#15803D',
    gradient: ['#4ADE80', '#16A34A', '#15803D', '#166534'],
    cardBg: 'rgba(255,255,255,0.12)',
    cardBgHover: 'rgba(255,255,255,0.18)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.75)',
    textDisabled: 'rgba(255,255,255,0.35)',
    borderColor: 'rgba(255,255,255,0.15)',
    borderColorStrong: 'rgba(255,255,255,0.40)',
    modalBg: '#14532d',
    overlayBg: 'rgba(0,0,0,0.6)',
    error: '#EF4444',
    success: '#10B981',
  },
  rose: {
    id: 'rose',
    label: 'Rose',
    bgPrimary: '#E11D48',
    bgSecondary: '#BE123C',
    gradient: ['#FB7185', '#E11D48', '#BE123C', '#9F1239'],
    cardBg: 'rgba(255,255,255,0.12)',
    cardBgHover: 'rgba(255,255,255,0.18)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.75)',
    textDisabled: 'rgba(255,255,255,0.35)',
    borderColor: 'rgba(255,255,255,0.15)',
    borderColorStrong: 'rgba(255,255,255,0.40)',
    modalBg: '#881337',
    overlayBg: 'rgba(0,0,0,0.6)',
    error: '#FCA5A5',
    success: '#10B981',
  },
  saffron: {
    id: 'saffron',
    label: 'Saffron',
    bgPrimary: '#D97706',
    bgSecondary: '#B45309',
    gradient: ['#FCD34D', '#F59E0B', '#D97706', '#92400E'],
    cardBg: 'rgba(255,255,255,0.12)',
    cardBgHover: 'rgba(255,255,255,0.18)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.75)',
    textDisabled: 'rgba(255,255,255,0.35)',
    borderColor: 'rgba(255,255,255,0.15)',
    borderColorStrong: 'rgba(255,255,255,0.40)',
    modalBg: '#78350f',
    overlayBg: 'rgba(0,0,0,0.6)',
    error: '#EF4444',
    success: '#10B981',
  },
  midnight: {
    id: 'midnight',
    label: 'Midnight',
    bgPrimary: '#6366F1',
    bgSecondary: '#4F46E5',
    gradient: ['#818CF8', '#6366F1', '#4F46E5', '#3730A3'],
    cardBg: 'rgba(255,255,255,0.10)',
    cardBgHover: 'rgba(255,255,255,0.16)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.75)',
    textDisabled: 'rgba(255,255,255,0.35)',
    borderColor: 'rgba(255,255,255,0.15)',
    borderColorStrong: 'rgba(255,255,255,0.40)',
    modalBg: '#1e1b4b',
    overlayBg: 'rgba(0,0,0,0.7)',
    error: '#EF4444',
    success: '#10B981',
  },
  custom: {
    id: 'custom',
    label: 'Custom',
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
};

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (id: ThemeId, customTheme?: AppTheme) => void;
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
  const [currentTheme, setCurrentTheme] = React.useState<AppTheme | null>(null);
  const selectedTheme = (useAuthStore(
    (s) => s.selectedTheme
  ) ?? 'purple') as ThemeId;

  const theme = currentTheme ?? (THEMES[selectedTheme] ?? THEMES.purple);

  const setTheme = useCallback(async (id: ThemeId, customTheme?: AppTheme) => {
    if (customTheme) {
      setCurrentTheme(customTheme);
    } else {
      setCurrentTheme(null);
      useAuthStore.getState().setTheme(id);
    }
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
