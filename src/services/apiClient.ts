import type {
  Instrument, Level, Course, CourseDetail,
  LessonDetail, UserProgress, ProgressSummary, SaveProgressPayload,
  TunePathUser
} from '@/src/types/models';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

// Token getter — set by TokenProvider after Clerk loads
let _getToken: (() => Promise<string | null>) | null = null;

export function setTokenGetter(fn: () => Promise<string | null>) {
  _getToken = fn;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = _getToken ? await _getToken() : null;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string; error?: { message?: string } })?.detail ?? (err as { error?: { message?: string } })?.error?.message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────
export async function syncUser(payload: {
  clerkUserId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}): Promise<TunePathUser> {
  return request<TunePathUser>('/api/auth/sync', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ── Instruments & Levels ──────────────────────────────────────────────────
export async function getInstruments(): Promise<Instrument[]> {
  return request<Instrument[]>('/api/instruments');
}

export async function getLevels(): Promise<Level[]> {
  return request<Level[]>('/api/levels');
}

// ── Courses ───────────────────────────────────────────────────────────────
export async function getCourses(params: {
  instrument?: string;
  level?: string;
  page?: number;
  limit?: number;
}): Promise<Course[]> {
  const query = new URLSearchParams();
  if (params.instrument) query.set('instrument', params.instrument);
  if (params.level) query.set('level', params.level);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  return request<Course[]>(`/api/courses?${query.toString()}`);
}

export async function getCourse(courseId: string): Promise<CourseDetail> {
  return request<CourseDetail>(`/api/courses/${courseId}`);
}

// ── Lessons ───────────────────────────────────────────────────────────────
export async function getLessonDetail(lessonId: string): Promise<LessonDetail> {
  return request<LessonDetail>(`/api/lessons/${lessonId}`);
}

// ── Progress ──────────────────────────────────────────────────────────────
export async function saveProgress(payload: SaveProgressPayload): Promise<UserProgress> {
  return request<UserProgress>('/api/progress', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getProgressSummary(): Promise<ProgressSummary> {
  return request<ProgressSummary>('/api/progress/summary');
}

// ── Legacy helper kept for useUserSync compatibility ─────────────────────
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export type { Course, CourseDetail, LessonDetail, UserProgress, ProgressSummary, SaveProgressPayload, TunePathUser };
