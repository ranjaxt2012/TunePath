/**
 * useHarmoniumSound - play harmonium notes from sargam
 * Resolves sargam -> western note -> .wav sample, plays via expo-av
 * Uses lazy require to avoid crash when ExponentAV native module is unavailable (Expo Go / dev).
 */

import { useCallback } from 'react';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { resolveSargamToSample } from '../services/soundResolver';

function getExpoAudio(): typeof import('expo-av').Audio | null {
  if (Platform.OS === 'web') return null;
  if (Constants.executionEnvironment !== ExecutionEnvironment.Standalone) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-av').Audio;
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
  const playNote = useCallback(async (sargam: string, octave?: number) => {
    const Audio = getExpoAudio();
    if (!Audio) return;

    const source = resolveSargamToSample(sargam, octave);
    if (source === null) return;

    try {
      const { sound } = await Audio.Sound.createAsync(source);
      await sound.playAsync();
      // Unload after playback (approx 1.5s for a typical note)
      setTimeout(() => {
        sound.unloadAsync().catch(() => {});
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
        await playNote(note);
        await new Promise((r) => setTimeout(r, delayMs));
      }
    },
    [playNote]
  );

  return { playNote, playFirstNote, playNotationSequence };
}
