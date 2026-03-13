import { useState, useEffect, useCallback } from 'react';
import { getLessonDetail } from '@/src/services/apiClient';
import type { LessonDetail } from '@/src/types/models';

export function useLesson(lessonId: string | undefined) {
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!lessonId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await getLessonDetail(lessonId);
      setLesson(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    load();
  }, [load]);

  return { lesson, loading, error, refetch: load };
}
