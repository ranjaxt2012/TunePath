/**
 * Sound Resolver - resolves sargam/western notes to audio samples.
 * No local files: returns null (playback is no-op). Future: resolve from R2 URLs via API.
 */

export function resolveWesternNoteToSample(_note: string): number | null {
  return null;
}

export function resolveSargamToSample(
  _sargam: string,
  _octave?: number
): number | null {
  return null;
}
