// TODO: route path constants for navigation
export const ROUTES = {
  HOME: '/home',
  PRACTICE: '/practice',
  PROGRESS: '/progress',
  PROFILE: '/profile',
  LOGIN: '/login',
  SELECT_INSTRUMENT: '/select/instrument',
  SELECT_LEVEL: '/select/level',
  LESSON: (id: string) => `/lesson/${id}`,
  COURSE: (id: string) => `/course/${id}`,
} as const;
