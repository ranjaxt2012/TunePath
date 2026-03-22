import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { api, setAuthToken } from '@/src/services/api';
import type { Lesson } from '@/src/types/models';
import { Log } from '@/src/utils/log';

interface NoteLike {
  time: number;
  note: string;
  octave?: number;
  duration?: number;
  lyric?: string;
  confidence?: number;
}

function generateMockNotes(): NoteLike[] {
  const noteNames = ['Sa', 'Re', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni', 'Sa'];
  const notes: NoteLike[] = [];
  let time = 1.0;
  for (let i = 0; i < 32; i++) {
    notes.push({
      time,
      note: noteNames[i % noteNames.length],
      octave: i > 15 ? 1 : 0,
      duration: 0.75,
      lyric: noteNames[i % noteNames.length],
      confidence: 0.9,
    });
    time += 0.8;
  }
  return notes;
}

export function useLesson(id: string | undefined) {
  const { getToken } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [notes, setNotes] = useState<NoteLike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);
  const fetchedIdRef = useRef<string>('');

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    // Only fetch if id changed
    if (fetchedRef.current && fetchedIdRef.current === id) return;

    fetchedRef.current = true;
    fetchedIdRef.current = id;

    const fetchLesson = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        setAuthToken(token);
        const data = await api.get<Lesson>(`/api/lessons/${id}`);
        setLesson(data);

        // Fetch notation if available
        if ((data as any).notation_url) {
          try {
            const notationData = await fetch((data as any).notation_url).then(r => r.json());
            const noteArray = Array.isArray(notationData)
              ? notationData
              : notationData.notes ?? [];
            setNotes(noteArray);
          } catch (err) {
            Log.apiError('notation fetch failed', err);
            setNotes([]);
          }
        } else if (__DEV__) {
          setNotes(generateMockNotes());
        } else {
          setNotes([]);
        }
      } catch (e: any) {
        setError(e.message ?? 'Failed to load lesson');
        setLesson(null);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchLesson();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run if id changes
  }, [id]);

  return { lesson, notes, loading, error };
}
