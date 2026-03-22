import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// TokenCache interface compatible with @clerk/clerk-expo
export interface TokenCache {
  getToken: (key: string) => Promise<string | null>;
  saveToken: (key: string, value: string) => Promise<void>;
  clearToken?: (key: string) => Promise<void>;
}

const createTokenCache = (): TokenCache => ({
  getToken: async (key: string) => {
    if (Platform.OS === 'web') {
      try { return localStorage.getItem(key); } catch { return null; }
    }
    return SecureStore.getItemAsync(key);
  },
  saveToken: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      try { localStorage.setItem(key, value); } catch { /* ignore */ }
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  clearToken: async (key: string) => {
    if (Platform.OS === 'web') {
      try { localStorage.removeItem(key); } catch { /* ignore */ }
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
});

export const tokenCache = createTokenCache();
