import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useAuth } from '@clerk/clerk-expo';
import {
  DEFAULT_THEME,
  SEASONAL_THEMES,
  STANDARD_THEMES,
  Theme,
  ThemeId,
  THEMES,
} from './themes';
import { useAuthStore } from '@/src/store/authStore';

interface ThemeContextValue {
  theme: Theme;
  themeId: ThemeId;
  setTheme: (
    id: ThemeId,
    custom?: Partial<Theme>
  ) => Promise<void>;
  standardThemes: Theme[];
  seasonalThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  themeId: 'purple',
  setTheme: async () => {},
  standardThemes: STANDARD_THEMES,
  seasonalThemes: SEASONAL_THEMES,
});

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setCurrentTheme] =
    useState<Theme>(DEFAULT_THEME);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const saved = useAuthStore
      .getState()
      .selectedTheme as ThemeId | undefined;
    if (saved && THEMES[saved]) {
      setCurrentTheme(THEMES[saved]);
    }
  }, []);

  const setTheme = useCallback(
    async (id: ThemeId, custom?: Partial<Theme>) => {
      const base = THEMES[id] ?? DEFAULT_THEME;
      const resolved: Theme = custom
        ? { ...base, ...custom, id: 'custom' }
        : base;
      setCurrentTheme(resolved);
      useAuthStore.getState().setTheme(id);
      if (isSignedIn) {
        try {
          const { patchPreferences, getPreferences } = await import(
            '@/src/services/apiClient'
          );
          const current = await getPreferences();
          await patchPreferences({ ...current, preferred_theme: id });
        } catch {
          // silent fail — theme still applied locally
        }
      }
    },
    [isSignedIn]
  );

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeId: theme.id,
        setTheme,
        standardThemes: STANDARD_THEMES,
        seasonalThemes: SEASONAL_THEMES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
