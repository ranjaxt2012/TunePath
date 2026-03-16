/**
 * useHarmoniumSound - play harmonium notes from sargam
 * Resolves sargam -> western note -> .wav sample, plays via expo-audio
 */

import { useCallback } from 'react';
import { resolveSargamToSample } from '../services/soundResolver';

function getCreateAudioPlayer(): typeof import('expo-audio').createAudioPlayer | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-audio').createAudioPlayer as typeof import('expo-audio').createAudioPlayer;
  } catch {
    return null;
  }
}

const SARGAM_REGEX = /\b(Sa|Re|Ga|Ma|Pa|Dha|Ni)\b/gi;
const SEQUENCE_DELAY_MS = 400;

function normalizeSargam(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/**
 * Parse notation string and extract first sargam note
 * "Sa Re Ga Ma" -> "Sa"
 * "Re Ga Re" -> "Re"
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
 * Hook for playing harmonium sounds
 */
export function useHarmoniumSound() {
  const playNote = useCallback((sargam: string, octave?: number) => {
    const createAudioPlayer = getCreateAudioPlayer();
    if (!createAudioPlayer) return;

    const source = resolveSargamToSample(sargam, octave);
    if (source === null) return;

    try {
      const player = createAudioPlayer(source);
      player.play();
      // Release after playback (approx 1.5s for a typical note)
      setTimeout(() => {
        try { player.remove(); } catch { /* ignore */ }
      }, 1500);
    } catch (_err) {
      if (__DEV__) {
        // TODO: add proper logger for play failure
      }
    }
  }, []);

  const playFirstNote = useCallback(
    (notation: string) => {
      const note = getFirstSargamNote(notation);
      if (note) {
        playNote(note);
      } else if (__DEV__) {
        // TODO: add proper logger for sargam parse
      }
    },
    [playNote]
  );

  /**
   * Parse notation string and play notes one by one with delay
   * Optional, isolated helper - e.g. playNotationSequence("Sa Re Ga Ma")
   */
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
