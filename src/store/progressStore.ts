import { create } from 'zustand';

type ProgressState = {
  completionMap: Record<string, boolean>;
  setComplete: (lessonId: string, value: boolean) => void;
  setCompletionFromApi: (lessonId: string, completed: boolean) => void;
  isComplete: (lessonId: string) => boolean;
};

export const useProgressStore = create<ProgressState>((set, get) => ({
  completionMap: {},
  setComplete: (lessonId: string, value: boolean) => {
    set((state) => ({
      completionMap: { ...state.completionMap, [lessonId]: value },
    }));
  },
  setCompletionFromApi: (lessonId: string, completed: boolean) => {
    set((state) => ({
      completionMap: { ...state.completionMap, [lessonId]: completed },
    }));
  },
  isComplete: (lessonId: string) => Boolean(get().completionMap[lessonId]),
}));
