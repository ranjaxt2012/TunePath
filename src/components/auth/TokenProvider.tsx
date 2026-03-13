import { useAuth } from '@clerk/clerk-expo';
import { useEffect } from 'react';
import { setTokenGetter } from '@/src/services/apiClient';

export function TokenProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    setTokenGetter(async () => {
      try {
        return await getToken();
      } catch {
        return null;
      }
    });
  }, [getToken]);

  return <>{children}</>;
}
