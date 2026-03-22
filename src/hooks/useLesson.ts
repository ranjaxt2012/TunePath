import { useState, useEffect, useRef } from 'react';
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

function convertSectionsToNotes(data: any): Note[] {
  if (!data) return [];

  // Already in notes format
  if (Array.isArray(data)) return data as Note[];
  if (Array.isArray(data.notes)) return data.notes as Note[];

  // Convert sections format to notes
  if (Array.isArray(data.sections)) {
    const notes: Note[] = [];
    for (const section of data.sections) {
      const noteNames: string[] = (section.notation as string)
        .trim()
        .split(/\s+/)
        .filter(Boolean);

      const totalDuration = section.endSec - section.startSec;
      const noteDuration = totalDuration / noteNames.length;

      noteNames.forEach((noteName, idx) => {
        notes.push({
          time: section.startSec + idx * noteDuration,
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

export function useLesson(id: string | undefined) {
  const { getToken } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
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
          const notationUrl = (data as any).notation_url;
          fetch(notationUrl)
            .then((r) => r.json())
            .then((notationData) => {
              try {
                const noteArray = convertSectionsToNotes(notationData);
                setNotes(noteArray);
              } catch {
                setNotes([]);
              }
            })
            .catch((err) => {
              Log.apiError('notation fetch failed', err);
              setNotes([]);
            });
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
