import { useState, useEffect, useCallback } from 'react';
import { getInstruments } from '@/src/services/apiClient';
import type { Instrument } from '@/src/types/models';

export function useInstruments() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getInstruments();
      setInstruments(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { instruments, loading, error, refetch: load };
}
