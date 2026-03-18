/**
 * SargamPlayerEngine — plain TypeScript playback engine for sargam notation.
 * No React. No JSX. UI subscribes via callbacks only.
 *
 * Uses expo-audio createAudioPlayer for note playback.
 */

import { createAudioPlayer } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
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
  private player: AudioPlayer | null = null;
  private destroyed: boolean = false;

  // ── Callbacks ──────────────────────────────────────────────────────────────
  onIndexChange?: (index: number) => void;
  onPlayStateChange?: (playing: boolean) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  /** Fires on every syncToTime. progress 0 = note just started, 1 = about to change. */
  onNoteProgress?: (progress: number) => void;

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
    this._stopPlayer();
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
    this._stopPlayer();

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

  /**
   * Sync notation index to video position (video is source of truth).
   * Binary search for current note; playbackSpeed scales note progress for sustain.
   */
  syncToTime(positionSeconds: number, playbackSpeed: number = 1.0): void {
    if (this.notes.length === 0) return;

    let lo = 0;
    let hi = this.notes.length - 1;
    let newIndex = -1;

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (this.notes[mid].time <= positionSeconds) {
        newIndex = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    if (newIndex < 0) return;

    const currentNote = this.notes[newIndex];
    const nextNote = this.notes[newIndex + 1];

    if (nextNote && playbackSpeed > 0) {
      const noteDuration =
        (nextNote.time - currentNote.time) / playbackSpeed;
      const timeInNote = positionSeconds - currentNote.time;
      const progress = Math.min(
        1.0,
        Math.max(0.0, timeInNote / noteDuration)
      );
      this.onNoteProgress?.(progress);
    }

    if (newIndex === this.currentIndex) return;
    this.currentIndex = newIndex;
    this.onIndexChange?.(newIndex);

    const lastNote = this.notes[this.notes.length - 1];
    if (positionSeconds >= lastNote.time + 1.0) {
      this.currentIndex = -1;
      this.onIndexChange?.(-1);
      this.onComplete?.();
    }
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
    this.onNoteProgress = undefined;
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
      this._stopPlayer();
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
    await this._stopPlayerAsync();

    if (this.destroyed) return;

    try {
      const player = createAudioPlayer(source, { downloadFirst: true });
      // Ensure fresh start and play immediately
      player.seekTo(0);
      player.play();
      if (this.destroyed) {
        player.remove();
        return;
      }
      this.player = player;
    } catch (e) {
      console.error('SargamEngine audio error for note:', normalized, e);
      this.onError?.(e as Error);
    }
  }

  /** Fire-and-forget stop. Safe to call any time. */
  private _stopPlayer(): void {
    if (!this.player) return;
    const p = this.player;
    this.player = null;
    try {
      p.pause();
    } finally {
      // remove() frees resources
      p.remove();
    }
  }

  /** Fully awaited stop. Call this before creating a new sound. */
  private async _stopPlayerAsync(): Promise<void> {
    if (!this.player) return;
    const p = this.player;
    this.player = null;
    try {
      p.pause();
    } catch {
      // Ignore cleanup errors — sound may already be unloaded
    } finally {
      try {
        p.remove();
      } catch {
        // ignore
      }
    }
  }

  private _clearTicker(): void {
    if (this.tickerHandle !== null) {
      clearTimeout(this.tickerHandle);
      this.tickerHandle = null;
    }
  }
}
