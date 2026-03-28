import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { api, setAuthToken } from '@/src/services/api';
import type { Course } from '@/src/types/models';

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);
  const { getToken } = useAuth();
  // Store getToken in a ref so it never appears in useEffect deps
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  useEffect(() => {
    if (fetchedRef.current) return;

    let cancelled = false;
    const fetchData = async () => {
      try {
        const token = await getTokenRef.current();
        if (cancelled) return;
        setAuthToken(token);
        const data = await api.get<Course[]>('/api/courses');
        if (cancelled) return;
        setCourses(data);
        fetchedRef.current = true;
      } catch (e: unknown) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load courses');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchData();
    return () => { cancelled = true; };
  }, []); // Empty deps — getToken is in ref, fetch runs once

  return { courses, loading, error };
}
