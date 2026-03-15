/**
 * SargamPlayerEngine — plain TS playback engine for sargam notation.
 * No React. UI subscribes via callbacks and drives nothing.
 */

import { Audio } from 'expo-av';
import type { Note } from '@/src/utils/notation';

export class SargamPlayerEngine {
  private notes: Note[] = [];
  private bpm: number = 80;
  private currentIndex: number = -1;
  private playing: boolean = false;
  private tickerHandle: ReturnType<typeof setTimeout> | null = null;
  private sound: Audio.Sound | null = null;
  private sampleMap: Record<string, number> = {};

  onIndexChange?: (index: number) => void;
  onPlayStateChange?: (playing: boolean) => void;
  onComplete?: () => void;

  load(notes: Note[], sampleMap: Record<string, number>): void {
    this.notes = notes;
    this.sampleMap = sampleMap;
    this.currentIndex = -1;
  }

  setBpm(bpm: number): void {
    this.bpm = bpm;
  }

  async play(): Promise<void> {
    if (this.playing) return;
    this.playing = true;
    this.onPlayStateChange?.(true);
    void this._tick();
  }

  pause(): void {
    if (!this.playing) return;
    this.playing = false;
    this._clearTicker();
    void this._stopSound();
    this.onPlayStateChange?.(false);
  }

  stop(): void {
    this.pause();
    this.currentIndex = -1;
    this.onIndexChange?.(-1);
  }

  seekToIndex(index: number, resume?: boolean): void {
    const clamped = Math.max(0, Math.min(index, this.notes.length - 1));
    const wasPlaying = resume ?? this.playing;

    this._clearTicker();
    void this._stopSound();

    this.currentIndex = clamped;
    this.onIndexChange?.(clamped);

    if (wasPlaying && this.notes.length > 0) {
      this.playing = true;
      void this._playNote(this.notes[clamped].note);
      const ms = (60 / this.bpm) * 1000;
      this.tickerHandle = setTimeout(() => void this._tick(), ms);
    }
  }

  seekToRatio(ratio: number, resume?: boolean): void {
    if (this.notes.length <= 1) {
      this.seekToIndex(0, resume);
      return;
    }
    const index = Math.round(ratio * (this.notes.length - 1));
    this.seekToIndex(index, resume);
  }

  destroy(): void {
    this.stop();
    this.onIndexChange = undefined;
    this.onPlayStateChange = undefined;
    this.onComplete = undefined;
    void this._stopSound();
  }

  private async _tick(): Promise<void> {
    if (!this.playing) return;

    const next = this.currentIndex + 1;

    if (next >= this.notes.length) {
      this.playing = false;
      this.currentIndex = -1;
      this._clearTicker();
      await this._stopSound();
      this.onIndexChange?.(-1);
      this.onPlayStateChange?.(false);
      this.onComplete?.();
      return;
    }

    this.currentIndex = next;
    this.onIndexChange?.(next);

    await this._playNote(this.notes[next].note);

    const ms = (60 / this.bpm) * 1000;
    this.tickerHandle = setTimeout(() => {
      void this._tick();
    }, ms);
  }

  private async _playNote(noteName: string): Promise<void> {
    const normalized =
      noteName.charAt(0).toUpperCase() + noteName.slice(1).toLowerCase();
    const source = this.sampleMap[normalized];
    if (!source) return;

    await this._stopSound();

    try {
      const { sound } = await Audio.Sound.createAsync(source, {
        shouldPlay: true,
        volume: 1.0,
      });
      this.sound = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          void sound.unloadAsync();
          if (this.sound === sound) this.sound = null;
        }
      });
    } catch (e) {
      console.error('SargamPlayerEngine audio error:', e);
    }
  }

  private async _stopSound(): Promise<void> {
    if (!this.sound) return;
    try {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
    } catch {
      /* ignore */
    }
    this.sound = null;
  }

  private _clearTicker(): void {
    if (this.tickerHandle) {
      clearTimeout(this.tickerHandle);
      this.tickerHandle = null;
    }
  }
}
