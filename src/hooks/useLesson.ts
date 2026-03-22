import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        setAuthToken(token);
        const data = await api.get<Lesson>(`/api/lessons/${id}`);
        if (!cancelled) setLesson(data);
      } catch (e: any) {
        if (!cancelled) setError(e.message ?? 'Failed to load lesson');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, getToken]);

  useEffect(() => {
    if (!lesson) {
      setNotes([]);
      return;
    }

    if (__DEV__ && !lesson.notation_url) {
      setNotes(generateMockNotes());
      return;
    }

    if (!lesson.notation_url) {
      setNotes([]);
      return;
    }

    setNotes([]);
    fetch(lesson.notation_url)
      .then((r) => r.json())
      .then((data) => {
        const noteArray = Array.isArray(data) ? data : data?.notes ?? [];
        setNotes(noteArray);
      })
      .catch((err) => {
        Log.apiError('notation fetch failed', err);
        setNotes([]);
      });
  }, [lesson?.notation_url]);

  return { lesson, notes, loading, error };
}
