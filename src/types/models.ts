export interface Lesson {
  id: string;
  title: string;
  video_url: string | null;
  thumbnail_url: string | null;
  notation_url: string | null;
  duration_seconds: number;
  status: string;
  creator_id: string;
  /** Present for tutor-owned lessons; used to gate edit mode. */
  tutor_id?: string;
  creator_name?: string;
  creator_verified?: boolean;
  instrument_slug?: string;
  level_slug?: string;
  view_count: number;
  like_count: number;
  tags?: string[];
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  instrument_slug?: string;
  level_slug?: string;
  lesson_count?: number;
  creator_name?: string;
}

export interface Creator {
  id: string;
  username?: string;
  display_name: string;
  avatar_url?: string;
  is_verified: boolean;
  bio?: string;
  follower_count: number;
  lesson_count: number;
  whatsapp?: string;
  email?: string;
  website?: string;
  youtube?: string;
  instagram?: string;
}

export interface UserProgress {
  lesson_id: string;
  watch_percent: number;
  completed: boolean;
  last_position: number;
}

export type LessonProcessingStatus =
  | 'queued'
  | 'uploaded'
  | 'processing'
  | 'detecting_pitches'
  | 'transcribing_lyrics'
  | 'finalising_notation'
  | 'review_ready'
  | 'published'
  | 'failed';

export interface LessonProcessingState {
  status: LessonProcessingStatus;
  source_type: 'direct_upload' | 'youtube';
  stage_label: string;
  progress_percent: number;
  notation_draft: Record<string, unknown> | null;
  error_message: string | null;
}
