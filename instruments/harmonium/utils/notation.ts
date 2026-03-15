/**
 * Flattens sargam notation sections into a flat Note[] array.
 * Distributes time linearly across notes within each section.
 * Supports startSec/endSec (preferred) or start/end.
 */
import { parseSargamNotes } from '@/src/hooks/useHarmoniumSound';
import type { Note } from '@/src/utils/notation';

export type NotationSection = {
  notation: string;
  startSec?: number;
  endSec?: number;
  start?: number;
  end?: number;
};

export function flattenSargamSections(sections: NotationSection[]): Note[] {
  const notes: Note[] = [];
  for (const sec of sections) {
    const start = sec.startSec ?? sec.start ?? 0;
    const end = sec.endSec ?? sec.end ?? start + 1;
    const tokens = parseSargamNotes(sec.notation);
    if (tokens.length === 0) continue;
    const step = (end - start) / tokens.length;
    tokens.forEach((token, i) => {
      notes.push({ note: token, time: start + (i + 0.5) * step });
    });
  }
  return notes;
}
