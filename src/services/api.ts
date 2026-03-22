import { Platform } from 'react-native';
import { Log } from '@/src/utils/log';

export const BASE_URL =
  Platform.OS === 'web'
    ? (process.env.EXPO_PUBLIC_API_URL_WEB ?? 'https://api.tune-path.com')
    : (process.env.EXPO_PUBLIC_API_URL ?? 'https://api.tune-path.com');

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  Log.api(`${options.method ?? 'GET'} ${path}`);
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    Log.apiError(`❌ ${path}`, { status: res.status, error: err });
    throw new Error((err as any).detail ?? `HTTP ${res.status}`);
  }
  Log.api(`✅ ${path}`, { status: res.status });
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
