import { api } from './api';

interface UserPreferences {
  preferred_theme?: string;
  preferred_instrument?: string;
  preferred_level?: string;
}

export async function getPreferences(): Promise<UserPreferences> {
  return api.get<UserPreferences>('/api/users/me/preferences');
}

export async function patchPreferences(prefs: UserPreferences): Promise<UserPreferences> {
  return api.patch<UserPreferences>('/api/users/me/preferences', prefs);
}
