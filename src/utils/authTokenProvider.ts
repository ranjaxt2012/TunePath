/**
 * Allows apiClient to attach Clerk JWT to requests.
 * Set by TokenProvider in root layout when Clerk is loaded.
 */
let tokenGetter: (() => Promise<string | null>) | null = null;

export function setTokenGetter(getter: () => Promise<string | null>): void {
  tokenGetter = getter;
}

export async function getAuthToken(): Promise<string | null> {
  if (!tokenGetter) return null;
  return tokenGetter();
}
