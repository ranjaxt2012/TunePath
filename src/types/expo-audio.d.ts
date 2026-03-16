/**
 * Type declaration for optional expo-audio dependency.
 * Runtime may not have this module; useHarmoniumSound handles null.
 */
declare module 'expo-audio' {
  export interface AudioPlayer {
    play(): void;
    remove(): void;
  }

  export function createAudioPlayer(source: number): AudioPlayer;
}
