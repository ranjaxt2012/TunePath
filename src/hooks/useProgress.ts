// TODO: load/save progress via src/services/progress, return { progress, saveProgress, loading, error }
import type { UserProgress, SaveProgressPayload } from '@/src/types/models';

export type UseProgressResult = {
  progress: UserProgress | null;
  saveProgress: (_payload: SaveProgressPayload) => Promise<void>;
  loading: boolean;
  error: boolean;
};

export function useProgress(_courseId: string): UseProgressResult {
  return {
    progress: null,
    saveProgress: async () => {},
    loading: false,
    error: false,
  };
}
