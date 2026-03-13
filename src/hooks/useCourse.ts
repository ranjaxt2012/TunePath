import { useState, useEffect, useCallback } from 'react';
import { getCourse } from '@/src/services/apiClient';
import type { CourseDetail } from '@/src/types/models';

export function useCourse(courseId: string | undefined) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!courseId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await getCourse(courseId);
      setCourse(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  return { course, loading, error, refetch: load };
}
