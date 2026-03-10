/**
 * TunePath API Client
 *
 * Supports DEV, TEST, and PROD environments via NODE_ENV.
 * Use getApiBaseUrl() to verify environment configuration.
 *
 * Environment variables:
 *   - NEXT_PUBLIC_API_BASE_URL_DEV (or EXPO_PUBLIC_API_BASE_URL_DEV)
 *   - NEXT_PUBLIC_API_BASE_URL_TEST (or EXPO_PUBLIC_API_BASE_URL_TEST)
 *   - NEXT_PUBLIC_API_BASE_URL_PROD (or EXPO_PUBLIC_API_BASE_URL_PROD)
 */

// -----------------------------------------------------------------------------
// Types (Phase-1 aligned - see src/types/models.ts)
// -----------------------------------------------------------------------------

import type { Course, CourseProgress, LessonDetail, LessonListItem } from '../types/models';

export type ApiEnvironment = 'development' | 'test' | 'production';

export type { Course, CourseProgress, LessonDetail, LessonListItem };

/** Lesson list item or full detail - use LessonDetail for player, LessonListItem for lists */
export type Lesson = LessonListItem | LessonDetail;

export interface UpdateProgressPayload {
  course_id: number;
  lesson_id: number;
  last_position_seconds: number;
  progress_percent: number;
  completed: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// -----------------------------------------------------------------------------
// Environment & Base URL
// -----------------------------------------------------------------------------

const ENV_PREFIXES = ['NEXT_PUBLIC_', 'EXPO_PUBLIC_'] as const;

function getEnvVar(key: string): string | undefined {
  for (const prefix of ENV_PREFIXES) {
    const fullKey = `${prefix}API_BASE_URL_${key}`;
    const value = (process.env as Record<string, string | undefined>)[fullKey];
    if (value) return value;
  }
  return (process.env as Record<string, string | undefined>)[`API_BASE_URL_${key}`];
}

/**
 * Resolves the API base URL based on NODE_ENV.
 * - development → DEV
 * - test → TEST
 * - otherwise → PROD
 */
export function getApiBaseUrl(): string {
  const env = process.env.NODE_ENV;
  let url: string | undefined;

  if (env === 'development') {
    url = getEnvVar('DEV') ?? 'http://localhost:8000';
  } else if (env === 'test') {
    url = getEnvVar('TEST') ?? 'https://api-test.tunepath.com';
  } else {
    url = getEnvVar('PROD') ?? 'https://api.tunepath.com';
  }

  return url.replace(/\/$/, '');
}

// -----------------------------------------------------------------------------
// API Client
// -----------------------------------------------------------------------------

const BASE_URL = getApiBaseUrl();
const REQUEST_TIMEOUT_MS = 10_000;

const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'X-User-Id': '1',
};

function isNetworkError(e: unknown): boolean {
  if (e instanceof TypeError) return true;
  return e instanceof Error && e.name === 'AbortError';
}

async function doRequest<T>(
  path: string,
  options: RequestInit,
  controller: AbortController
): Promise<T> {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    ...DEFAULT_HEADERS,
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, { ...options, headers, signal: controller.signal });
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    const body = isJson ? await response.json().catch(() => null) : await response.text().catch(() => null);
    const err = new ApiError(
      `API error: ${response.status} ${response.statusText}`,
      response.status,
      body
    );
    console.error(`[API] ${path} failed:`, err.message, body ?? '');
    throw err;
  }

  if (response.status === 204 || (options.method === 'POST' && !isJson)) {
    return undefined as T;
  }

  if (isJson) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const attempt = async (): Promise<T> => {
    try {
      return await doRequest<T>(path, options, controller);
    } finally {
      clearTimeout(timeout);
    }
  };

  try {
    return await attempt();
  } catch (e) {
    if (isNetworkError(e)) {
      const controller2 = new AbortController();
      const timeout2 = setTimeout(() => controller2.abort(), REQUEST_TIMEOUT_MS);
      try {
        return await doRequest<T>(path, { ...options, signal: controller2.signal }, controller2);
      } catch (retryErr) {
        clearTimeout(timeout2);
        console.error(`[API] ${path} network error (after retry):`, retryErr);
        throw retryErr;
      }
    }
    throw e;
  }
}

// -----------------------------------------------------------------------------
// Endpoint Helpers
// -----------------------------------------------------------------------------

/**
 * GET /courses/?instrument={instrument}&level={level}
 */
export async function getCourses(
  instrument: string,
  level: string
): Promise<Course[]> {
  const params = new URLSearchParams({ instrument, level });
  const data = await request<Course[]>(`/courses/?${params}`);
  return Array.isArray(data) ? data : [];
}

/**
 * GET /courses/{course_id}
 */
export async function getCourse(courseId: number): Promise<Course | null> {
  try {
    return (await request<Course>(`/courses/${courseId}`)) as Course;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

/**
 * GET /users/me/recent-courses
 */
export async function getRecentCourses(): Promise<Course[]> {
  const data = await request<Course[] | { courses?: Course[] }>('/users/me/recent-courses');
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray((data as { courses?: Course[] }).courses)) {
    return (data as { courses: Course[] }).courses;
  }
  return [];
}

/**
 * GET /courses/{course_id}/lessons
 */
export async function getCourseLessons(courseId: number): Promise<LessonListItem[]> {
  const data = await request<LessonListItem[] | { lessons?: LessonListItem[] }>(`/courses/${courseId}/lessons`);
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray((data as { lessons?: Lesson[] }).lessons)) {
    return (data as { lessons: Lesson[] }).lessons;
  }
  return [];
}

/**
 * GET /courses/{course_id}/progress
 */
export async function getCourseProgress(
  courseId: number
): Promise<CourseProgress | null> {
  try {
    const data = await request<CourseProgress | { progress?: CourseProgress }>(
      `/courses/${courseId}/progress`
    );
    if (data && typeof data === 'object') {
      return 'progress' in data ? (data.progress ?? null) : (data as CourseProgress);
    }
    return null;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

/**
 * POST /progress/
 */
export async function updateProgress(
  payload: UpdateProgressPayload
): Promise<void> {
  await request('/progress/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * POST /courses/{course_id}/restart
 */
export async function restartCourse(courseId: number): Promise<void> {
  await request(`/courses/${courseId}/restart`, { method: 'POST' });
}

/**
 * GET /lessons/{lesson_id} - full lesson with media URLs (load on demand)
 * Returns video_url, thumbnail_url, sections etc for streaming from R2
 */
export async function getLessonDetail(lessonId: number): Promise<LessonDetail> {
  const data = await request<LessonDetail | { lesson?: LessonDetail }>(`/lessons/${lessonId}`);
  if (data && typeof data === 'object' && 'lesson' in data) {
    return (data as { lesson: LessonDetail }).lesson as LessonDetail;
  }
  return data as LessonDetail;
}

// -----------------------------------------------------------------------------
// Example Usage (React / React Native)
// -----------------------------------------------------------------------------
/*
// In a React component:
// import type { Course } from '../services/apiClient';
// import {
//   getCourses,
//   getRecentCourses,
//   getCourseLessons,
//   getCourseProgress,
//   updateProgress,
//   restartCourse,
//   getApiBaseUrl,
//   ApiError,
// } from '../services/apiClient';
// import { useEffect, useState } from 'react';
// import { Text, View } from 'react-native';
//
// function MyComponent() {
//   const [courses, setCourses] = useState<Course[]>([]);
//   const [error, setError] = useState<string | null>(null);
//
//   useEffect(() => {
//     async function load() {
//       try {
//         const data = await getCourses('harmonium', 'beginner');
//         setCourses(data);
//       } catch (e) {
//         if (e instanceof ApiError) {
//           setError(`${e.message} (${e.status})`);
//         } else {
//           setError('Failed to load courses');
//         }
//       }
//     }
//     load();
//   }, []);
//
//   return (
//     <View>
//       <Text>API: {getApiBaseUrl()}</Text>
//       {error && <Text>{error}</Text>}
//       {courses.map((c) => <Text key={c.id}>{c.title}</Text>)}
//     </View>
//   );
// }
*/
