// TODO: Zustand store — cached progress by course
import type { UserProgress } from '@/src/types/models';

type ProgressState = {
  byCourseId: Record<string, UserProgress | null>;
};

export const useProgressStore = (): ProgressState => ({
  byCourseId: {},
});
