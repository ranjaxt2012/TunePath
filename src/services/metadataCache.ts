/**
 * Simple in-memory metadata cache for courses and lessons.
 * Cache persists for the session. Prepares for future offline: can add
 * persistence layer (AsyncStorage) or prefetch logic later without changing callers.
 */

import type { Course, LessonDetail } from './apiClient';

const courseCache = new Map<string, Course>();
const lessonCache = new Map<string, LessonDetail>();

export function getCachedCourse(id: string): Course | undefined {
  return courseCache.get(id);
}

export function setCachedCourse(course: Course): void {
  courseCache.set(course.id, course);
}

export function setCachedCourses(courses: Course[]): void {
  courses.forEach((c) => courseCache.set(c.id, c));
}

export function getCachedLesson(id: string): LessonDetail | undefined {
  return lessonCache.get(id);
}

export function setCachedLesson(lesson: LessonDetail): void {
  lessonCache.set(lesson.id, lesson);
}
