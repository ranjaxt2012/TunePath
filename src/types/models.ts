export type UserRole = 'learner' | 'tutor' | 'contributor' | 'admin' | 'power_admin';
export type ActiveMode = 'learner' | 'tutor' | 'admin';
export type ContentStatus = 'draft' | 'in_review' | 'scheduled' | 'published' | 'archived';
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

export type TunePathUser = {
  id: string;
  clerkUserId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  roles: UserRole[];
  activeMode: string;
};

export type Instrument = {
  id: string;
  slug: string;
  name: string;
  icon_url: string | null;
  sort_order: number;
};

export type Level = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  thumbnail_key: string | null;
  instrument_slug: string;
  level_slug: string;
  is_free: boolean;
  status: ContentStatus;
  tutor_id: string;
  sort_order: number;
};

export type LessonSummary = {
  id: string;
  title: string;
  slug: string;
  duration_seconds: number | null;
  thumbnail_key: string | null;
  is_free: boolean;
  lesson_number: number | null;
  sort_order: number;
};

// Alias used by LessonRow
export type LessonListItem = LessonSummary;

export type CourseDetail = Course & {
  lessons: LessonSummary[];
};

export type LessonDetail = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  tutor_id: string;
  course_id: string | null;
  lesson_number: number | null;
  duration_seconds: number | null;
  video_url: string | null;
  thumbnail_url: string | null;
  notation_url: string | null;
  youtube_url: string | null;
  is_free: boolean;
  instrument_slug: string | null;
};

export type UserProgress = {
  lesson_id: string;
  status: ProgressStatus;
  watch_percent: number;
  last_position_seconds: number;
};

export type ProgressSummary = {
  total_practice_seconds: number;
  completed_lessons: number;
  recent_sessions: {
    lesson_title: string;
    duration_seconds: number;
    started_at: string;
  }[];
  by_instrument: {
    slug: string;
    name: string;
    percent: number;
  }[];
};

export type SaveProgressPayload = {
  lesson_id: string;
  course_id: string | null;
  watch_percent: number;
  last_position_seconds: number;
};
