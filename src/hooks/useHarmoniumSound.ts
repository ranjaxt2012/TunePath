/**
 * useHarmoniumSound — play harmonium sargam notes via expo-audio.
 * Uses shared HARMONIUM_SAMPLE_MAP for built-in samples.
 */

import { useCallback } from 'react';
import { createAudioPlayer } from 'expo-audio';
import { HARMONIUM_SAMPLE_MAP } from '@/src/instruments/harmonium/sampleMap';

const SARGAM_REGEX = /\b(Sa|Re|Ga|Ma|Pa|Dha|Ni)\b/gi;
const SEQUENCE_DELAY_MS = 400;
const NOTE_RELEASE_MS = 1500;

function normalizeSargam(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/**
 * Parse notation string and extract first sargam note
 * "Sa Re Ga Ma" -> "Sa"
 */
export function getFirstSargamNote(notation: string): string | null {
  const match = notation.trim().match(SARGAM_REGEX);
  return match ? normalizeSargam(match[0]) : null;
}

/**
 * Parse notation string and extract all sargam notes in order
 * "Sa Re Ga Ma" -> ["Sa", "Re", "Ga", "Ma"]
 */
export function parseSargamNotes(notation: string): string[] {
  const matches = notation.trim().match(SARGAM_REGEX);
  return (matches ?? []).map(normalizeSargam);
}

/**
 * Hook for playing harmonium sounds (expo-audio).
 */
export function useHarmoniumSound() {
  const playNote = useCallback((sargam: string, _octave?: number) => {
    const normalized = normalizeSargam(sargam);
    const source = HARMONIUM_SAMPLE_MAP[normalized];
    if (source === undefined) return;

    void (async () => {
      try {
        const player = createAudioPlayer(source, { downloadFirst: true });
        player.seekTo(0);
        player.play();
        setTimeout(() => {
          try {
            player.pause();
          } catch {
            /* ignore cleanup errors */
          }
          try {
            player.remove();
          } catch {
            /* ignore cleanup errors */
          }
        }, NOTE_RELEASE_MS);
      } catch {
        if (__DEV__) {
          // TODO: add proper logger for play failure
        }
      }
    })();
  }, []);

  const playFirstNote = useCallback(
    (notation: string) => {
      const note = getFirstSargamNote(notation);
      if (note) playNote(note);
    },
    [playNote]
  );

  const playNotationSequence = useCallback(
    async (notation: string, delayMs: number = SEQUENCE_DELAY_MS) => {
      const notes = parseSargamNotes(notation);
      for (const note of notes) {
        playNote(note);
        await new Promise((r) => setTimeout(r, delayMs));
      }
    },
    [playNote]
  );

  return { playNote, playFirstNote, playNotationSequence };
}
