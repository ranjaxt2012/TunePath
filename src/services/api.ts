import { Platform } from 'react-native';
import { Log } from '@/src/utils/log';

export const BASE_URL =
  Platform.OS === 'web'
    ? (process.env.EXPO_PUBLIC_API_URL_WEB ?? 'https://api.tune-path.com')
    : (process.env.EXPO_PUBLIC_API_URL ?? 'https://api.tune-path.com');

let authToken: string | null = null;
let refreshTokenFn: (() => Promise<string | null>) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function setRefreshToken(fn: () => Promise<string | null>) {
  refreshTokenFn = fn;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const makeRequest = async (token: string | null) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) ?? {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    Log.api(`${options.method ?? 'GET'} ${path}`);
    return fetch(`${BASE_URL}${path}`, { ...options, headers });
  };

  let res = await makeRequest(authToken);

  if (res.status === 401 && refreshTokenFn) {
    const newToken = await refreshTokenFn();
    if (newToken) {
      setAuthToken(newToken);
      res = await makeRequest(newToken);
    }
  }

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
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
