import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProgressState {
  favorites: string[];
  positions: Record<string, number>;
  completedLessons: string[];
  toggleFavorite: (lessonId: string) => void;
  isFavorite: (lessonId: string) => boolean;
  savePosition: (id: string, secs: number) => void;
  getPosition: (id: string) => number;
  markComplete: (id: string) => void;
  isComplete: (id: string) => boolean;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      favorites: [],
      positions: {},
      completedLessons: [],
      toggleFavorite: (lessonId) =>
        set((s) => ({
          favorites: s.favorites.includes(lessonId)
            ? s.favorites.filter((id) => id !== lessonId)
            : [...s.favorites, lessonId],
        })),
      isFavorite: (lessonId) => get().favorites.includes(lessonId),
      savePosition: (id, secs) =>
        set((s) => ({ positions: { ...s.positions, [id]: secs } })),
      getPosition: (id) => get().positions[id] ?? 0,
      markComplete: (id) =>
        set((s) => ({
          completedLessons: s.completedLessons.includes(id)
            ? s.completedLessons
            : [...s.completedLessons, id],
        })),
      isComplete: (id) => get().completedLessons.includes(id),
    }),
    {
      name: 'progress-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
