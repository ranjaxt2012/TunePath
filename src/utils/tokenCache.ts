import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY_PREFIX = 'clerk_token_';

export const tokenCache = {
  async getToken(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY_PREFIX + key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY_PREFIX + key, value);
    } catch {
      // silently fail — user will need to re-auth
    }
  },
  async clearToken(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY_PREFIX + key);
    } catch {
      // silently fail
    }
  },
};
