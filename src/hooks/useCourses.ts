import { useState, useEffect, useCallback } from 'react';
import { getCourses } from '@/src/services/apiClient';
import type { Course } from '@/src/types/models';

export function useCourses(instrument?: string, level?: string) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!instrument || !level) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await getCourses({ instrument, level });
      setCourses(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [instrument, level]);

  useEffect(() => {
    load();
  }, [load]);

  return { courses, loading, error, refetch: load };
}
