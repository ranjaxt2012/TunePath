/**
 * Web stub - sound playback not supported on web (no wav bundling)
 * Tap-to-play will no-op
 */

import { useCallback } from 'react';

const SARGAM_REGEX = /\b(Sa|Re|Ga|Ma|Pa|Dha|Ni)\b/gi;
const SEQUENCE_DELAY_MS = 400;

function normalizeSargam(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function getFirstSargamNote(notation: string): string | null {
  const match = notation.trim().match(SARGAM_REGEX);
  return match ? normalizeSargam(match[0]) : null;
}

export function parseSargamNotes(notation: string): string[] {
  const matches = notation.trim().match(SARGAM_REGEX);
  return (matches ?? []).map(normalizeSargam);
}

export function useHarmoniumSound() {
  const playNote = useCallback(async (_sargam: string, _octave?: number) => {
    // No-op on web
  }, []);

  const playFirstNote = useCallback((_notation: string) => {
    // No-op on web
  }, []);

  const playNotationSequence = useCallback(
    async (_notation: string, _delayMs: number = SEQUENCE_DELAY_MS) => {
      // No-op on web
    },
    []
  );

  return { playNote, playFirstNote, playNotationSequence };
}
