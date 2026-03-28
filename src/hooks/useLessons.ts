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
  // Store getToken in a ref so it never appears in useEffect deps
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;
  // Track the last fetched options key to prevent duplicate fetches
  const fetchedKeyRef = useRef<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = useCallback(async (cancelled?: { value: boolean }) => {
    const key = `${options.instrument ?? ''}|${options.tag ?? ''}|${options.sort ?? ''}|${options.limit ?? ''}`;
    if (fetchedKeyRef.current === key) return; // Already fetched these exact options
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
      fetchedKeyRef.current = key; // Mark these options as fetched
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
    fetchedKeyRef.current = null; // Reset guard so refetch is forced
    void fetchLessons();
  }, [fetchLessons]);

  return { lessons, loading, error, refetch };
}
