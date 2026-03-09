/**
 * Sound Resolver - resolves sargam/western notes to sample assets
 * Uses static require() for Metro bundler compatibility
 */

import { getSargamMap } from './instrumentLoader';

// Static require map - Metro needs literal paths
const WAV_SAMPLES: Record<string, number> = {
  A2: require('../../content/harmonium/base_sounds/harmonium-a2.wav'),
  A3: require('../../content/harmonium/base_sounds/harmonium-a3.wav'),
  A4: require('../../content/harmonium/base_sounds/harmonium-a4.wav'),
  B2: require('../../content/harmonium/base_sounds/harmonium-b2.wav'),
  B3: require('../../content/harmonium/base_sounds/harmonium-b3.wav'),
  B4: require('../../content/harmonium/base_sounds/harmonium-b4.wav'),
  C2: require('../../content/harmonium/base_sounds/harmonium-c2.wav'),
  C3: require('../../content/harmonium/base_sounds/harmonium-c3.wav'),
  C4: require('../../content/harmonium/base_sounds/harmonium-c4.wav'),
  C5: require('../../content/harmonium/base_sounds/harmonium-c5.wav'),
  D2: require('../../content/harmonium/base_sounds/harmonium-d2.wav'),
  D3: require('../../content/harmonium/base_sounds/harmonium-d3.wav'),
  D4: require('../../content/harmonium/base_sounds/harmonium-d4.wav'),
  D5: require('../../content/harmonium/base_sounds/harmonium-d5.wav'),
  E2: require('../../content/harmonium/base_sounds/harmonium-e2.wav'),
  E3: require('../../content/harmonium/base_sounds/harmonium-e3.wav'),
  E4: require('../../content/harmonium/base_sounds/harmonium-e4.wav'),
  F2: require('../../content/harmonium/base_sounds/harmonium-f2.wav'),
  F3: require('../../content/harmonium/base_sounds/harmonium-f3.wav'),
  F4: require('../../content/harmonium/base_sounds/harmonium-f4.wav'),
  G2: require('../../content/harmonium/base_sounds/harmonium-g2.wav'),
  G3: require('../../content/harmonium/base_sounds/harmonium-g3.wav'),
  G4: require('../../content/harmonium/base_sounds/harmonium-g4.wav'),
};

const DEFAULT_OCTAVE = 4;

/**
 * Resolve western note (e.g. "C4") to sample require id, or null if not found
 */
export function resolveWesternNoteToSample(note: string): number | null {
  const key = note.trim();
  const sample = WAV_SAMPLES[key];
  if (!sample) {
    if (__DEV__) {
      console.warn(`[SoundResolver] No sample found for western note: "${note}"`);
    }
    return null;
  }
  return sample;
}

/**
 * Resolve sargam syllable to sample require id
 * @param sargam - e.g. "Sa", "Re", "Ga"
 * @param octave - default 4 (middle scale: Sa=C4, Re=D4, ...)
 */
export function resolveSargamToSample(
  sargam: string,
  octave: number = DEFAULT_OCTAVE
): number | null {
  const map = getSargamMap();
  const letter = map[sargam.trim()];
  if (!letter) {
    if (__DEV__) {
      console.warn(`[SoundResolver] Unknown sargam syllable: "${sargam}"`);
    }
    return null;
  }
  const westernNote = `${letter}${octave}`;
  return resolveWesternNoteToSample(westernNote);
}
