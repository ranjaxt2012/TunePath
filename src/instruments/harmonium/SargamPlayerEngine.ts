import { createAudioPlayer, AudioPlayer } from 'expo-audio';

export interface Note {
  note: string;
  time: number; // seconds
}

export class SargamPlayerEngine {
  onIndexChange?: (index: number) => void;
  onNoteProgress?: (progress: number) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;

  private notes: Note[] = [];
  private sampleMap: Record<string, any> = {};
  private players: Map<string, AudioPlayer> = new Map();
  private lastIndex = -1;
  private lastProgress = -1;
  private _soundEnabled = true;

  setSoundEnabled(enabled: boolean): void {
    this._soundEnabled = enabled;
  }

  load(notes: Note[], sampleMap: Record<string, any>): void {
    this.notes = notes;
    this.sampleMap = sampleMap;
    // Preload players for unique notes
    const unique = [...new Set(notes.map((n) => n.note))];
    for (const noteName of unique) {
      const source = sampleMap[noteName];
      if (source && !this.players.has(noteName)) {
        try {
          this.players.set(noteName, createAudioPlayer(source));
        } catch { /* ignore load errors */ }
      }
    }
  }

  syncToTime(seconds: number, _speed: number): void {
    if (this.notes.length === 0) return;

    // Binary search for current note index
    const idx = this.findNoteIndex(seconds);
    if (idx < 0 || idx >= this.notes.length) return;

    // Fire onIndexChange if changed
    if (idx !== this.lastIndex) {
      this.lastIndex = idx;
      this.onIndexChange?.(idx);

      // Play the note (if sound enabled)
      if (this._soundEnabled) {
        const noteName = this.notes[idx].note;
        const player = this.players.get(noteName);
        if (player) {
          try {
            player.seekTo(0);
            player.play();
          } catch { /* ignore */ }
        }
      }
    }

    // Compute progress within current note
    const current = this.notes[idx];
    const next = this.notes[idx + 1];
    if (next) {
      const duration = next.time - current.time;
      const elapsed = seconds - current.time;
      const progress = duration > 0 ? Math.min(elapsed / duration, 1) : 0;
      // Throttle: only fire if changed by >0.05
      if (Math.abs(progress - this.lastProgress) >= 0.05) {
        this.lastProgress = progress;
        this.onNoteProgress?.(progress);
      }
    }

    // Complete if past last note
    if (idx === this.notes.length - 1) {
      const lastNote = this.notes[this.notes.length - 1];
      if (seconds >= lastNote.time + 2) {
        this.onComplete?.();
      }
    }
  }

  private findNoteIndex(seconds: number): number {
    // Find last note whose time <= seconds
    let lo = 0, hi = this.notes.length - 1, result = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (this.notes[mid].time <= seconds) {
        result = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return result;
  }

  destroy(): void {
    for (const player of this.players.values()) {
      try { player.remove(); } catch { /* ignore */ }
    }
    this.players.clear();
    this.notes = [];
  }
}
