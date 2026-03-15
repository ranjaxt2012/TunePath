/**
 * SargamPlayerEngine — plain TypeScript playback engine for sargam notation.
 * No React. No JSX. UI subscribes via callbacks only.
 *
 * Uses expo-av Audio.Sound for reliable audio on SDK 55.
 */

import { Audio } from 'expo-av';
import type { Note } from '@/src/utils/notation';

export class SargamPlayerEngine {
  // ── Private state ──────────────────────────────────────────────────────────
  private notes: Note[] = [];
  private sampleMap: Record<string, number> = {};
  private bpm: number = 80;
  private currentIndex: number = -1;
  private _playing: boolean = false;
  private _seeking: boolean = false;
  private tickerHandle: ReturnType<typeof setTimeout> | null = null;
  private sound: Audio.Sound | null = null;
  private destroyed: boolean = false;

  // ── Callbacks ──────────────────────────────────────────────────────────────
  onIndexChange?: (index: number) => void;
  onPlayStateChange?: (playing: boolean) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;

  // ── Public API ─────────────────────────────────────────────────────────────

  load(notes: Note[], sampleMap: Record<string, number>): void {
    this._clearTicker();
    this.notes = [...notes];
    this.sampleMap = { ...sampleMap };
    this.currentIndex = -1;
    this._playing = false;
  }

  async play(): Promise<void> {
    if (this._playing || this.destroyed) return;
    if (this.notes.length === 0) return;
    this._playing = true;
    this.onPlayStateChange?.(true);
    await this._tick();
  }

  pause(): void {
    if (!this._playing) return;
    this._playing = false;
    this._clearTicker();
    this._stopSound();
    this.onPlayStateChange?.(false);
  }

  stop(): void {
    this.pause();
    this.currentIndex = -1;
    this.onIndexChange?.(-1);
  }

  seekToIndex(index: number, shouldResume: boolean): void {
    if (this.notes.length === 0) return;

    const clamped = Math.max(0, Math.min(index, this.notes.length - 1));

    this._clearTicker();
    this._stopSound();

    const wasPlaying = this._playing;
    this._playing = false;

    // Set to one before target so _tick() advances to it
    this.currentIndex = clamped - 1;
    this.onIndexChange?.(clamped - 1);

    if ((wasPlaying || shouldResume) && this.notes.length > 0) {
      this._playing = true;
      this.onPlayStateChange?.(true);
      void this._tick();
    }
  }

  seekToRatio(ratio: number, shouldResume: boolean): void {
    const clamped = Math.max(0, Math.min(ratio, 1));
    const index = Math.round(clamped * (this.notes.length - 1));
    this.seekToIndex(index, shouldResume);
  }

  setBpm(bpm: number): void {
    this.bpm = Math.max(20, Math.min(300, bpm));
  }

  isPlaying(): boolean {
    return this._playing;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  destroy(): void {
    this.destroyed = true;
    this._clearTicker();
    this._stopSound();
    this.onIndexChange = undefined;
    this.onPlayStateChange = undefined;
    this.onComplete = undefined;
    this.onError = undefined;
  }

  // ── Private methods ────────────────────────────────────────────────────────

  private async _tick(): Promise<void> {
    if (!this._playing) return;
    if (this.destroyed) return;
    if (this._seeking) return;

    const next = this.currentIndex + 1;

    // Song complete
    if (next >= this.notes.length) {
      this._playing = false;
      this.currentIndex = -1;
      this._clearTicker();
      this._stopSound();
      this.onIndexChange?.(-1);
      this.onPlayStateChange?.(false);
      this.onComplete?.();
      return;
    }

    // Advance index and notify UI
    this.currentIndex = next;
    this.onIndexChange?.(next);

    // Fire and forget — do NOT await. Awaiting _playNote would delay
    // the ticker and cause notes to drift behind BPM schedule.
    void this._playNote(this.notes[next].note);

    // Schedule next tick at current BPM
    const ms = (60 / this.bpm) * 1000;
    this.tickerHandle = setTimeout(() => {
      void this._tick();
    }, ms);
  }

  private async _playNote(noteName: string): Promise<void> {
    if (this.destroyed) return;

    const normalized =
      noteName.charAt(0).toUpperCase() + noteName.slice(1).toLowerCase();

    const source = this.sampleMap[normalized];
    if (source === undefined) {
      console.error('SargamEngine: no sample for note:', normalized);
      return;
    }

    // Fully await stop of previous sound BEFORE creating the new one.
    // This prevents the race condition (old sound outliving new sound)
    // that caused single-note playback.
    await this._stopSoundAsync();

    if (this.destroyed) return;

    try {
      const { sound } = await Audio.Sound.createAsync(
        source,
        { shouldPlay: true, volume: 1.0, positionMillis: 0 },
        null,
        true // downloadFirst — load fully before playing for reliability
      );

      if (this.destroyed) {
        await sound.unloadAsync();
        return;
      }

      this.sound = sound;
    } catch (e) {
      console.error('SargamEngine audio error for note:', normalized, e);
      this.onError?.(e as Error);
    }
  }

  /** Fire-and-forget stop. Safe to call any time. */
  private _stopSound(): void {
    if (!this.sound) return;
    const s = this.sound;
    this.sound = null;
    s.setVolumeAsync(0)
      .then(() => s.stopAsync())
      .then(() => s.unloadAsync())
      .catch(() => {});
  }

  /** Fully awaited stop. Call this before creating a new sound. */
  private async _stopSoundAsync(): Promise<void> {
    if (!this.sound) return;
    const s = this.sound;
    this.sound = null;
    try {
      await s.setVolumeAsync(0);
      await s.stopAsync();
      await s.unloadAsync();
    } catch {
      // Ignore cleanup errors — sound may already be unloaded
    }
  }

  private _clearTicker(): void {
    if (this.tickerHandle !== null) {
      clearTimeout(this.tickerHandle);
      this.tickerHandle = null;
    }
  }
}
