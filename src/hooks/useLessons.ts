import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { api, setAuthToken } from '@/src/services/api';
import type { Lesson } from '@/src/types/models';

interface UseLessonsOptions {
  instrument?: string;
  tag?: string;
  sort?: string;
  limit?: number;
}

export function useLessons(options: UseLessonsOptions = {}) {
  const { getToken } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      setAuthToken(token);
      const params = new URLSearchParams();
      if (options.instrument) params.set('instrument', options.instrument);
      if (options.tag) params.set('tag', options.tag);
      if (options.sort) params.set('sort', options.sort);
      if (options.limit) params.set('limit', String(options.limit));
      const query = params.toString();
      const data = await api.get<Lesson[]>(`/api/lessons${query ? `?${query}` : ''}`);
      setLessons(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load lessons');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken, options.instrument, options.tag, options.sort, options.limit]);

  useEffect(() => {
    void fetchLessons();
  }, [fetchLessons]);

  const refetch = useCallback(() => {
    void fetchLessons();
  }, [fetchLessons]);

  return { lessons, loading, error, refetch };
}
