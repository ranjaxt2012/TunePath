/**
 * useHarmoniumSound - play harmonium notes from sargam
 * Resolves sargam -> western note -> .wav sample, plays via expo-av
 */

import { Audio } from 'expo-av';
import { useCallback } from 'react';
import { resolveSargamToSample } from '../services/soundResolver';

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
  const playNote = useCallback(async (sargam: string, octave?: number) => {
    const source = resolveSargamToSample(sargam, octave);
    if (source === null) return;

    try {
      const { sound } = await Audio.Sound.createAsync(source);
      await sound.playAsync();
      // Unload after playback (approx 1.5s for a typical note)
      setTimeout(() => {
        sound.unloadAsync().catch(() => {});
      }, 1500);
    } catch (err) {
      if (__DEV__) {
        console.warn(`[HarmoniumSound] Failed to play "${sargam}":`, err);
      }
    }
  }, []);

  const playFirstNote = useCallback(
    (notation: string) => {
      const note = getFirstSargamNote(notation);
      if (note) {
        playNote(note);
      } else if (__DEV__) {
        console.warn(`[HarmoniumSound] No sargam note found in: "${notation}"`);
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
        await playNote(note);
        await new Promise((r) => setTimeout(r, delayMs));
      }
    },
    [playNote]
  );

  return { playNote, playFirstNote, playNotationSequence };
}
