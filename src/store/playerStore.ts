// TODO: Zustand store — active lesson, playback state, BPM
type PlayerState = {
  lessonId: number | null;
  positionSeconds: number;
  isPlaying: boolean;
  bpm: number;
};

export const usePlayerStore = (): PlayerState => ({
  lessonId: null,
  positionSeconds: 0,
  isPlaying: false,
  bpm: 60,
});
