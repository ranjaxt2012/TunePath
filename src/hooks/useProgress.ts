import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!isSignedIn) return;
    (async () => {
      try {
        const token = await getToken();
        setAuthToken(token);
        const [s, p] = await Promise.allSettled([
          api.get<ProgressSummary>('/api/progress/summary'),
          api.get<InProgressLesson[]>('/api/progress/in-progress'),
        ]);
        if (s.status === 'fulfilled') setSummary(s.value);
        if (p.status === 'fulfilled') setInProgress(p.value);
      } catch { /* best-effort */ } finally {
        setLoading(false);
      }
    })();
  }, [isSignedIn, getToken]);

  if (!isSignedIn) {
    return {
      summary: null,
      inProgress: [],
      loading: false,
    };
  }

  return { summary, inProgress, loading };
}
