import { useState, useEffect, useCallback } from 'react';
import { getInProgressLessons, type InProgressLesson } from '@/src/services/apiClient';
import { useAuthStore } from '@/src/store/authStore';

export function useInProgressLessons() {
  const { user } = useAuthStore();
  const [lessons, setLessons] = useState<InProgressLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getInProgressLessons();
      setLessons(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  return { lessons, loading, error, refetch: load };
}
