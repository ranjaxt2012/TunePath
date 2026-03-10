/**
 * Phase-1 frontend data model - aligned with backend API contracts.
 * Use IDs (course.id, lesson.id, instrument.slug, level.slug) for identity.
 * Titles/names are display-only; duplicate titles must be supported safely.
 */

export interface Instrument {
  slug: string;
  title: string;
}

export interface Level {
  slug: string;
  title: string;
}

export interface Course {
  id: number;
  external_key?: string;
  title: string;
  description?: string;
  instrument: string;
  level: string;
  tutor_name?: string;
  display_tutor_name?: string;
  thumbnail_url?: string;
  lesson_count?: number;
  is_published?: boolean;
  is_upcoming?: boolean;
  sort_order?: number;
}

export interface LessonListItem {
  id: number;
  external_key?: string;
  course_id: number;
  title: string;
  description?: string;
  lesson_order: number;
  thumbnail_url?: string;
  duration_seconds?: number;
  is_preview?: boolean;
}

export interface LessonDetail {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  lesson_order: number;
  thumbnail_url?: string;
  video_url?: string;
  audio_url?: string;
  notation_url?: string;
  duration_seconds?: number;
  is_preview?: boolean;
  sections?: { start: number; end: number; notation: string }[];
}

export interface CourseProgress {
  course_id: number;
  started?: boolean;
  completed?: boolean;
  current_lesson_id?: number;
  last_lesson_id?: number;
  last_position_seconds?: number;
  progress_percent: number;
  last_accessed_at?: string;
}
