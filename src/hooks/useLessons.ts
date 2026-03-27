import { useState, useEffect, useCallback, useRef } from 'react';
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
  const getTokenRef = useRef(getToken);
  useEffect(() => { getTokenRef.current = getToken; }, [getToken]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = useCallback(async (cancelled?: { value: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getTokenRef.current();
      if (cancelled?.value) return;
      setAuthToken(token);
      const params = new URLSearchParams();
      if (options.instrument) params.set('instrument', options.instrument);
      if (options.tag) params.set('tag', options.tag);
      if (options.sort) params.set('sort', options.sort);
      if (options.limit) params.set('limit', String(options.limit));
      const query = params.toString();
      const data = await api.get<Lesson[]>(`/api/lessons${query ? `?${query}` : ''}`);
      if (cancelled?.value) return;
      setLessons(data);
    } catch (e: unknown) {
      if (cancelled?.value) return;
      setError(e instanceof Error ? e.message : 'Failed to load lessons');
    } finally {
      if (!cancelled?.value) setLoading(false);
    }
  }, [options.instrument, options.tag, options.sort, options.limit]);

  useEffect(() => {
    const cancelled = { value: false };
    void fetchLessons(cancelled);
    return () => { cancelled.value = true; };
  }, [fetchLessons]);

  const refetch = useCallback(() => {
    void fetchLessons();
  }, [fetchLessons]);

  return { lessons, loading, error, refetch };
}
