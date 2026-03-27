import { Platform } from 'react-native';

export interface TokenCache {
  getToken: (key: string) => Promise<string | null>;
  saveToken: (key: string, value: string) => Promise<void>;
  clearToken?: (key: string) => Promise<void>;
}

export const tokenCache: TokenCache = {
  getToken: async (key: string) => {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      }
      const SecureStore = await import('expo-secure-store');
      return SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  saveToken: async (key: string, value: string) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
        return;
      }
      const SecureStore = await import('expo-secure-store');
      return SecureStore.setItemAsync(key, value);
    } catch { /* ignore */ }
  },
  clearToken: async (key: string) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
        return;
      }
      const SecureStore = await import('expo-secure-store');
      return SecureStore.deleteItemAsync(key);
    } catch { /* ignore */ }
  },
};
