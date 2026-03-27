import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { api, setAuthToken } from '@/src/services/api';
import type { Workflow } from '@/src/types/models';

export function useWorkflows() {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  useEffect(() => { getTokenRef.current = getToken; }, [getToken]);

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    let cancelled = false;

    const fetchWorkflows = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getTokenRef.current();
        if (cancelled) return;
        setAuthToken(token);
        const data = await api.get<{ workflows: Workflow[] }>('/api/workflows');
        if (cancelled) return;
        setWorkflows(data.workflows);
      } catch (e: unknown) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load workflows');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchWorkflows();
    return () => { cancelled = true; };
  }, []);

  return { workflows, loading, error };
}
