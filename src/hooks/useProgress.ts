import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { api, setAuthToken } from '@/src/services/api';

interface ProgressSummary {
  streak_days: number;
  total_minutes: number;
  lessons_completed: number;
}

interface InProgressLesson {
  lesson_id: string;
  title: string;
  thumbnail_url: string | null;
  instrument_slug?: string;
  watch_percent: number;
  last_position: number;
}

export function useProgress() {
  const { isSignedIn, getToken } = useAuth();
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [inProgress, setInProgress] = useState<InProgressLesson[]>([]);
  const [loading, setLoading] = useState(true);

  // Store getToken in a ref so the useEffect never needs it as a dep
  const getTokenRef = useRef(getToken);
  useEffect(() => { getTokenRef.current = getToken; });

  // Fetch only once on mount (when signed in)
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!isSignedIn) { setLoading(false); return; }
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    (async () => {
      try {
        const token = await getTokenRef.current();
        setAuthToken(token);
        const [s, p] = await Promise.allSettled([
          api.get<ProgressSummary>('/api/progress/summary'),
          api.get<InProgressLesson[]>('/api/progress/in-progress'),
        ]);
        if (s.status === 'fulfilled') setSummary(s.value);
        if (p.status === 'fulfilled') setInProgress(p.value);
      } finally {
        setLoading(false);
      }
    })();
  // Only re-run if isSignedIn changes (login/logout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  if (!isSignedIn) return { summary: null, inProgress: [], loading: false };
  return { summary, inProgress, loading };
}
