import { create } from 'zustand';

interface PlayerState {
  lessonId: string | null;
  isPlaying: boolean;
  activeNoteIndex: number;
  bpm: number;
  progress: number;
  setLessonId: (id: string | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setActiveNoteIndex: (index: number) => void;
  setBpm: (bpm: number) => void;
  setProgress: (progress: number) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  (set) => ({
    lessonId: null,
    isPlaying: false,
    activeNoteIndex: -1,
    bpm: 80,
    progress: 0,
    setLessonId: (id) => set({ lessonId: id }),
    setIsPlaying: (playing) => set({ isPlaying: playing }),
    setActiveNoteIndex: (index) => set({ activeNoteIndex: index }),
    setBpm: (bpm) => set({ bpm }),
    setProgress: (progress) => set({ progress }),
    reset: () => set({
      lessonId: null,
      isPlaying: false,
      activeNoteIndex: -1,
      bpm: 80,
      progress: 0,
    }),
  })
);
