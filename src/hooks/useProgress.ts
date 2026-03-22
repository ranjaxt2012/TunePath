import { useState, useEffect, useCallback } from 'react';
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
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 1;

  const fetchProgress = useCallback(async () => {
    try {
      const token = await getToken();
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
  }, [getToken]);

  useEffect(() => {
    if (!isSignedIn) return;
    if (retryCount >= MAX_RETRIES) return;

    fetchProgress().catch(() => {
      setRetryCount(r => r + 1);
      setLoading(false);
    });
  }, [isSignedIn, fetchProgress, retryCount]);

  if (!isSignedIn) {
    return {
      summary: null,
      inProgress: [],
      loading: false,
    };
  }

  return { summary, inProgress, loading };
}
