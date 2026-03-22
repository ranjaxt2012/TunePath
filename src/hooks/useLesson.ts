import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { api, setAuthToken } from '@/src/services/api';
import type { Lesson } from '@/src/types/models';

export function useLesson(id: string | undefined) {
  const { getToken } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        setAuthToken(token);
        const data = await api.get<Lesson>(`/api/lessons/${id}`);
        if (!cancelled) setLesson(data);
      } catch (e: any) {
        if (!cancelled) setError(e.message ?? 'Failed to load lesson');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, getToken]);

  return { lesson, loading, error };
}
