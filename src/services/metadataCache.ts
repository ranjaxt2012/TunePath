/**
 * Simple in-memory metadata cache for courses and lessons.
 * Cache persists for the session. Prepares for future offline: can add
 * persistence layer (AsyncStorage) or prefetch logic later without changing callers.
 */

import type { Course, Lesson } from './apiClient';

const courseCache = new Map<number, Course>();
const lessonCache = new Map<number, Lesson>();

export function getCachedCourse(id: number): Course | undefined {
  return courseCache.get(id);
}

export function setCachedCourse(course: Course): void {
  courseCache.set(course.id, course);
}

export function setCachedCourses(courses: Course[]): void {
  courses.forEach((c) => courseCache.set(c.id, c));
}

export function getCachedLesson(id: number): Lesson | undefined {
  return lessonCache.get(id);
}

export function setCachedLesson(lesson: Lesson): void {
  lessonCache.set(lesson.id, lesson);
}
