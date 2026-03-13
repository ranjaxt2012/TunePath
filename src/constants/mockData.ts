/**
 * TEMPORARY MOCK DATA — Remove before production
 * ───────────────────────────────────────────────
 * Search for "mockData" imports to find all usages.
 *
 * Replace with real API calls:
 * MOCK_IN_PROGRESS_LESSONS   → GET /api/progress (in-progress lessons)
 * MOCK_COURSE_ROWS           → GET /api/courses (grouped by category)
 * MOCK_FEATURED_COURSE       → GET /api/courses/featured
 * MOCK_PROGRESS_STATS        → GET /api/progress/summary
 * MOCK_WEEKLY_PROGRESS       → GET /api/progress/weekly
 * MOCK_INSTRUMENT_PROGRESS   → GET /api/progress/by-instrument
 * MOCK_RECENT_SESSIONS       → GET /api/progress/sessions
 */

export const MOCK_IN_PROGRESS_LESSONS = [
  {
    id: '50b6b4f9-d502-4ea2-ac33-5db6ed037243',
    title: 'Introduction to Sa Re Ga Ma',
    course_title: 'Basic Sargam',
    instrument_slug: 'harmonium',
    duration_seconds: 765,
    watch_percent: 65,
    last_position_seconds: 497,
    thumbnail_url: null,
  },
  {
    id: 'dee7a277-0e4d-45e7-a0ad-3d4041ae8f84',
    title: 'Pa Dha Ni Sa — Upper Octave',
    course_title: 'Basic Sargam',
    instrument_slug: 'harmonium',
    duration_seconds: 643,
    watch_percent: 30,
    last_position_seconds: 193,
    thumbnail_url: null,
  },
  {
    id: 'mock-003',
    title: 'Raag Yaman Basics',
    course_title: 'Raag Foundation',
    instrument_slug: 'harmonium',
    duration_seconds: 900,
    watch_percent: 10,
    last_position_seconds: 90,
    thumbnail_url: null,
  },
];

export const MOCK_FEATURED_COURSE = {
  id: 'mock-course-001',
  title: 'Harmonium for Beginners',
  description: 'Master the fundamentals of Harmonium — from your first note to playing full Raags.',
  instrument_slug: 'harmonium',
  level_slug: 'beginner',
  lesson_count: 12,
  thumbnail_url: null,
};

export const MOCK_PROGRESS_STATS = {
  total_minutes: 142,
  completed_lessons: 7,
  streak_days: 5,
};

export const MOCK_WEEKLY_PROGRESS = [
  { day: 'Mon', minutes: 20 },
  { day: 'Tue', minutes: 35 },
  { day: 'Wed', minutes: 0 },
  { day: 'Thu', minutes: 45 },
  { day: 'Fri', minutes: 15 },
  { day: 'Sat', minutes: 27 },
  { day: 'Sun', minutes: 0 },
];

export const MOCK_INSTRUMENT_PROGRESS = [
  { name: 'Harmonium', slug: 'harmonium', percent: 68 },
  { name: 'Guitar',    slug: 'guitar',    percent: 25 },
];

export const MOCK_RECENT_SESSIONS = [
  { id: '1', lesson_title: 'Sa Re Ga Ma',      duration_seconds: 765, date: 'Today' },
  { id: '2', lesson_title: 'Pa Dha Ni Sa',      duration_seconds: 420, date: 'Yesterday' },
  { id: '3', lesson_title: 'Raag Yaman Basics', duration_seconds: 300, date: 'Mar 9' },
];

export const MOCK_COURSE_ROWS = [
  {
    rowTitle: 'Harmonium — Beginner',
    courses: [
      { id: 'mock-course-001', title: 'Basic Sargam',    subtitle: '8 lessons',  progress: 0, thumbnail_url: null },
      { id: 'mock-course-003', title: 'Bhajan Basics',   subtitle: '6 lessons',  progress: 0, thumbnail_url: null },
      { id: 'mock-course-004', title: 'Folk Songs',      subtitle: '10 lessons', progress: 0, thumbnail_url: null },
    ],
  },
  {
    rowTitle: 'Popular This Week',
    courses: [
      { id: 'mock-course-005', title: 'Raag Yaman',        subtitle: '5 lessons', progress: 0, thumbnail_url: null },
      { id: 'mock-course-006', title: 'Classical Basics',  subtitle: '7 lessons', progress: 0, thumbnail_url: null },
      { id: 'mock-course-007', title: 'Devotional Songs',  subtitle: '4 lessons', progress: 0, thumbnail_url: null },
    ],
  },
];
