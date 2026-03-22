import { create } from 'zustand';

type ProgressState = {
  completionMap: Record<string, boolean>;
  favorites: string[];
  positions: Record<string, number>;
  completedLessons: string[];
  setComplete: (lessonId: string, value: boolean) => void;
  setCompletionFromApi: (lessonId: string, completed: boolean) => void;
  isComplete: (lessonId: string) => boolean;
  isFavorite: (lessonId: string) => boolean;
  toggleFavorite: (lessonId: string) => void;
  savePosition: (lessonId: string, seconds: number) => void;
  getPosition: (lessonId: string) => number;
  markComplete: (lessonId: string) => void;
};

export const useProgressStore = create<ProgressState>((set, get) => ({
  completionMap: {},
  favorites: [],
  positions: {},
  completedLessons: [],
  setComplete: (lessonId: string, value: boolean) => {
    set((state) => ({
      completionMap: { ...state.completionMap, [lessonId]: value },
      completedLessons: value
        ? state.completedLessons.includes(lessonId)
          ? state.completedLessons
          : [...state.completedLessons, lessonId]
        : state.completedLessons.filter((id) => id !== lessonId),
    }));
  },
  setCompletionFromApi: (lessonId: string, completed: boolean) => {
    set((state) => ({
      completionMap: { ...state.completionMap, [lessonId]: completed },
    }));
  },
  isComplete: (lessonId: string) => Boolean(get().completionMap[lessonId]),
  isFavorite: (lessonId: string) => get().favorites.includes(lessonId),
  toggleFavorite: (lessonId: string) => {
    set((state) => ({
      favorites: state.favorites.includes(lessonId)
        ? state.favorites.filter((f) => f !== lessonId)
        : [...state.favorites, lessonId],
    }));
  },
  savePosition: (lessonId: string, seconds: number) => {
    set((state) => ({
      positions: { ...state.positions, [lessonId]: seconds },
    }));
  },
  getPosition: (lessonId: string) => get().positions[lessonId] ?? 0,
  markComplete: (lessonId: string) => {
    set((state) => ({
      completionMap: { ...state.completionMap, [lessonId]: true },
      completedLessons: state.completedLessons.includes(lessonId)
        ? state.completedLessons
        : [...state.completedLessons, lessonId],
    }));
  },
}));
