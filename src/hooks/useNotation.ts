import { useState, useEffect, useCallback } from 'react';
import { flattenSargamSections } from '@/instruments/harmonium/utils/notation';
import type { Note } from '@/src/utils/notation';

type NotationJson = {
  notationType?: string;
  sections?: {
    notation: string;
    startSec?: number;
    endSec?: number;
    start?: number;
    end?: number;
  }[];
  notes?: { note: string; time: number; lyric?: string }[];
};

function parseNotationData(data: NotationJson): Note[] {
  if (data.notes && Array.isArray(data.notes)) {
    return data.notes.map((n) => ({
      note: n.note,
      time: n.time,
      lyric: n.lyric,
    }));
  }
  const sections = data.sections ?? [];
  return flattenSargamSections(sections);
}

export function useNotation(notationUrl: string | null) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!notationUrl) {
      setNotes([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(notationUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: NotationJson) => {
        setNotes(parseNotationData(data));
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Failed to load notation');
        setNotes([]);
      })
      .finally(() => setLoading(false));
  }, [notationUrl]);

  const getActiveNoteIndex = useCallback(
    (elapsedSeconds: number): number => {
      if (notes.length === 0) return 0;
      let idx = 0;
      for (let i = 0; i < notes.length; i++) {
        if (notes[i].time <= elapsedSeconds) idx = i;
      }
      return idx;
    },
    [notes]
  );

  return { notes, loading, error, getActiveNoteIndex };
}
