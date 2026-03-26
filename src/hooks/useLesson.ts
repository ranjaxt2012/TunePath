import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { api, setAuthToken } from '@/src/services/api';
import type { Lesson } from '@/src/types/models';
import { Log } from '@/src/utils/log';

export interface Note {
  time: number;
  note: string;
  octave: number;
  duration: number;
  lyric: string;
  confidence?: number;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function convertSectionsToNotes(data: unknown): Note[] {
  if (data == null) return [];
  if (Array.isArray(data)) {
    return data as Note[];
  }
  if (!isRecord(data)) return [];
  if (Array.isArray(data.notes)) {
    return data.notes as Note[];
  }
  if (Array.isArray(data.sections)) {
    const notes: Note[] = [];
    for (const section of data.sections) {
      if (!isRecord(section)) continue;
      const notation = section.notation;
      const startSec = section.startSec;
      const endSec = section.endSec;
      if (
        typeof notation !== 'string' ||
        typeof startSec !== 'number' ||
        typeof endSec !== 'number'
      ) {
        continue;
      }

      const noteNames: string[] = notation
        .trim()
        .split(/\s+/)
        .filter(Boolean);

      const totalDuration = endSec - startSec;
      const noteDuration = totalDuration / Math.max(noteNames.length, 1);

      noteNames.forEach((noteName, idx) => {
        notes.push({
          time: startSec + idx * noteDuration,
          note: noteName,
          octave: 0,
          duration: noteDuration * 0.9,
          lyric: noteName,
          confidence: 1.0,
        });
      });
    }
    return notes;
  }

  return [];
}

export function useLesson(id: string | undefined, refreshKey: number = 0) {
  const { getToken } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchLesson = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        setAuthToken(token);
        const data = await api.get<Lesson>(`/api/lessons/${id}`);
        if (cancelled) return;
        setLesson(data);

        if (data.notation_url) {
          try {
            const res = await fetch(data.notation_url);
            const notationData: unknown = await res.json();
            if (cancelled) return;
            const noteArray = convertSectionsToNotes(notationData);
            setNotes(noteArray);
          } catch (err) {
            if (cancelled) return;
            Log.apiError('notation fetch failed', err);
            setNotes([]);
          }
        } else {
          if (!cancelled) setNotes([]);
        }
      } catch (e: unknown) {
        if (cancelled) return;
        Log.apiError('lesson fetch failed', { lessonId: id, error: e instanceof Error ? e.message : String(e) });
        setError(e instanceof Error ? e.message : 'Failed to load lesson');
        setLesson(null);
        setNotes([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchLesson();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run if id changes
  }, [id, refreshKey]);

  return { lesson, notes, loading, error };
}
