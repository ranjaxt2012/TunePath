import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { api, setAuthToken } from '@/src/services/api';

export interface Instrument {
  id: string;
  name: string;
  slug: string;
  notation_modes: string[];
}

export function useInstruments() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
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
        const data = await api.get<Instrument[]>('/api/instruments');
        if (cancelled) return;
        setInstruments(data);
        fetchedRef.current = true;
      } catch (e: unknown) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load instruments');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchData();
    return () => { cancelled = true; };
  }, []); // Empty deps — getToken is in ref, fetch runs once

  return { instruments, loading, error };
}
