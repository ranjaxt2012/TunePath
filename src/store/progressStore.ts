import { create } from 'zustand';

type ProgressState = {
  completionMap: Record<string, boolean>;
  setComplete: (lessonId: string, value: boolean) => void;
  setCompletionFromApi: (lessonId: string, completed: boolean) => void;
  isComplete: (lessonId: string) => boolean;
  favorites: string[];
  toggleFavorite: (lessonId: string) => void;
};

export const useProgressStore = create<ProgressState>((set, get) => ({
  completionMap: {},
  favorites: [],
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
  toggleFavorite: (lessonId: string) => {
    set((state) => ({
      favorites: state.favorites.includes(lessonId)
        ? state.favorites.filter((f) => f !== lessonId)
        : [...state.favorites, lessonId],
    }));
  },
}));
