import { useState, useEffect } from 'react';
import { getCourses } from '@/src/services/apiClient';
import type { Course } from '@/src/types/models';

export function useFeaturedCourse() {
  const [course, setCourse] =
    useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<
    string | null
  >(null);

  useEffect(() => {
    getCourses({ limit: 1 })
      .then((res: Course[]) => {
        setCourse(
          Array.isArray(res)
            ? res[0] ?? null
            : null
        );
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { course, loading, error };
}
