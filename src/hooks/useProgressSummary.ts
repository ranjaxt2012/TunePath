import { useState, useEffect, useCallback } from 'react';
import { getProgressSummary } from '@/src/services/apiClient';
import type { ProgressSummary } from '@/src/types/models';
import { useAuthStore } from '@/src/store/authStore';

export function useProgressSummary() {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await getProgressSummary();
      setSummary(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  return { summary, loading, error, refetch: load };
}
