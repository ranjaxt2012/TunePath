export type ThemeId =
  | 'purple'
  | 'ocean'
  | 'forest'
  | 'rose'
  | 'saffron'
  | 'midnight'
  | 'holi'
  | 'stpatrick'
  | 'spring'
  | 'halloween'
  | 'diwali'
  | 'thanksgiving'
  | 'christmas'
  | 'winter'
  | 'newyear'
  | 'custom';

export interface Theme {
  id: ThemeId;
  label: string;
  isSeasonal: boolean;
  seasonalMonth?: number;
  seasonalEmoji?: string;
  isAnimated?: boolean;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  gradient: [string, string, string, string];
  background: string;
  surface: string;
  surfaceHigh: string;
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  textOnPrimary: string;
  border: string;
  borderStrong: string;
  error: string;
  success: string;
  warning: string;
  modalBg: string;
  overlay: string;
  divider: string;
}

// ─── Background tint generator ────────────────────────────────────────────────
// Mixes the primary color at very low opacity over near-black to produce
// dark tinted backgrounds that subtly reflect the theme hue.
export function generateBackground(primaryHex: string): {
  background: string;
  surface: string;
  surfaceHigh: string;
  modalBg: string;
} {
  const r = parseInt(primaryHex.slice(1, 3), 16);
  const g = parseInt(primaryHex.slice(3, 5), 16);
  const b = parseInt(primaryHex.slice(5, 7), 16);

  const background = `rgb(${Math.round(r * 0.06 + 5)},${Math.round(g * 0.06 + 5)},${Math.round(b * 0.06 + 5)})`;
  const surface    = `rgb(${Math.round(r * 0.10 + 12)},${Math.round(g * 0.10 + 12)},${Math.round(b * 0.10 + 12)})`;
  const surfaceHigh = `rgb(${Math.round(r * 0.14 + 18)},${Math.round(g * 0.14 + 18)},${Math.round(b * 0.14 + 18)})`;
  const modalBg    = `rgb(${Math.round(r * 0.12 + 10)},${Math.round(g * 0.12 + 10)},${Math.round(b * 0.12 + 10)})`;

  return { background, surface, surfaceHigh, modalBg };
}

// ─── Theme definitions ────────────────────────────────────────────────────────
export const THEMES: Record<ThemeId, Theme> = {
  purple: {
    id: 'purple',
    label: 'Purple',
    isSeasonal: false,
    primary: '#7C3AED',
    primaryLight: '#8B5CF6',
    primaryDark: '#5B21B6',
    gradient: ['#8B5CF6', '#7C3AED', '#6D28D9', '#4C1D95'],
    ...generateBackground('#7C3AED'),
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.65)',
    textDisabled: 'rgba(255,255,255,0.30)',
    textOnPrimary: '#FFFFFF',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.20)',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    overlay: 'rgba(0,0,0,0.75)',
    divider: '#000000',
  },
  ocean: {
    id: 'ocean',
    label: 'Ocean',
    isSeasonal: false,
    primary: '#0EA5E9',
    primaryLight: '#38BDF8',
    primaryDark: '#0284C7',
    gradient: ['#38BDF8', '#0EA5E9', '#0284C7', '#075985'],
    ...generateBackground('#0EA5E9'),
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.65)',
    textDisabled: 'rgba(255,255,255,0.30)',
    textOnPrimary: '#FFFFFF',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.20)',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    overlay: 'rgba(0,0,0,0.75)',
    divider: '#000000',
  },
  forest: {
    id: 'forest',
    label: 'Forest',
    isSeasonal: false,
    primary: '#16A34A',
    primaryLight: '#22C55E',
    primaryDark: '#15803D',
    gradient: ['#4ADE80', '#22C55E', '#16A34A', '#14532D'],
    ...generateBackground('#16A34A'),
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.65)',
    textDisabled: 'rgba(255,255,255,0.30)',
    textOnPrimary: '#FFFFFF',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.20)',
    error: '#EF4444',
    success: '#4ADE80',
    warning: '#F59E0B',
    overlay: 'rgba(0,0,0,0.75)',
    divider: '#000000',
  },
  rose: {
    id: 'rose',
    label: 'Rose',
    isSeasonal: false,
    primary: '#E11D48',
    primaryLight: '#FB7185',
    primaryDark: '#BE123C',
    gradient: ['#FB7185', '#F43F5E', '#E11D48', '#9F1239'],
    ...generateBackground('#E11D48'),
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.65)',
    textDisabled: 'rgba(255,255,255,0.30)',
    textOnPrimary: '#FFFFFF',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.20)',
    error: '#FCA5A5',
    success: '#10B981',
    warning: '#F59E0B',
    overlay: 'rgba(0,0,0,0.75)',
    divider: '#000000',
  },
  saffron: {
    id: 'saffron',
    label: 'Saffron',
    isSeasonal: false,
    primary: '#D97706',
    primaryLight: '#F59E0B',
    primaryDark: '#B45309',
    gradient: ['#FCD34D', '#F59E0B', '#D97706', '#92400E'],
    ...generateBackground('#D97706'),
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.65)',
    textDisabled: 'rgba(255,255,255,0.30)',
    textOnPrimary: '#FFFFFF',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.20)',
    error: '#EF4444',
    success: '#10B981',
    warning: '#FCD34D',
    overlay: 'rgba(0,0,0,0.75)',
    divider: '#000000',
  },
  midnight: {
    id: 'midnight',
    label: 'Midnight',
    isSeasonal: false,
    primary: '#6366F1',
    primaryLight: '#818CF8',
    primaryDark: '#4F46E5',
    gradient: ['#818CF8', '#6366F1', '#4F46E5', '#3730A3'],
    ...generateBackground('#6366F1'),
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.65)',
    textDisabled: 'rgba(255,255,255,0.30)',
    textOnPrimary: '#FFFFFF',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.20)',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    overlay: 'rgba(0,0,0,0.75)',
    divider: '#000000',
  },
  holi: {
    id: 'holi',
    label: 'Holi',
    isSeasonal: true,
    seasonalMonth: 3,
    seasonalEmoji: '🎨',
    isAnimated: true,
    primary: '#FF006E',
    primaryLight: '#FF4D9A',
    primaryDark: '#CC0058',
    gradient: ['#FF006E', '#FB5607', '#FFBE0B', '#8338EC'],
    ...generateBackground('#FF006E'),
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.65)',
    textDisabled: 'rgba(255,255,255,0.30)',
    textOnPrimary: '#FFFFFF',
    border: 'rgba(255,255,255,0.10)',
    borderStrong: 'rgba(255,255,255,0.25)',
    error: '#EF4444',
    success: '#10B981',
    warning: '#FFBE0B',
    overlay: 'rgba(0,0,0,0.75)',
    divider: '#000000',
  },
  stpatrick: {
    id: 'stpatrick',
    label: "St. Patrick's",
    isSeasonal: true,
    seasonalMonth: 3,
    seasonalEmoji: '🍀',
    isAnimated: false,
    primary: '#16A34A',
    primaryLight: '#22C55E',
    primaryDark: '#15803D',
    gradient: ['#4ADE80', '#16A34A', '#166534', '#C9A84C'],
    ...generateBackground('#16A34A'),
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.65)',
    textDisabled: 'rgba(255,255,255,0.30)',
    textOnPrimary: '#FFFFFF',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.20)',
    error: '#EF4444',
    success: '#4ADE80',
    warning: '#C9A84C',
    overlay: 'rgba(0,0,0,0.75)',
    divider: '#000000',
  },
  spring: {
    id: 'spring',
    label: 'Spring',
    isSeasonal: true,
    seasonalMonth: 4,
    seasonalEmoji: '🌸',
    isAnimated: false,
    primary: '#EC4899',
    primaryLight: '#F472B6',
    primaryDark: '#DB2777',
    gradient: ['#F9A8D4', '#EC4899', '#DB2777', '#9D174D'],
    ...generateBackground('#EC4899'),
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.65)',
    textDisabled: 'rgba(255,255,255,0.30)',
    textOnPrimary: '#FFFFFF',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.20)',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    overlay: 'rgba(0,0,0,0.75)',
    divider: '#000000',
  },
  halloween: {
    id: 'halloween',
    label: 'Halloween',
    isSeasonal: true,
    seasonalMonth: 10,
    seasonalEmoji: '🎃',
    isAnimated: false,
    primary: '#EA580C',
    primaryLight: '#FB923C',
    primaryDark: '#C2410C',
    gradient: ['#FB923C', '#EA580C', '#7C2D12', '#1C0A00'],
    ...generateBackground('#EA580C'),
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.65)',
    textDisabled: 'rgba(255,255,255,0.30)',
    textOnPrimary: '#FFFFFF',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.20)',
    error: '#FB923C',
    success: '#10B981',
    warning: '#FB923C',
    overlay: 'rgba(0,0,0,0.80)',
    divider: '#000000',
  },
  diwali: {
    id: 'diwali',
    label: 'Diwali',
    isSeasonal: true,
    seasonalMonth: 11,
    seasonalEmoji: '🪔',
    isAnimated: false,
    primary: '#D97706',
    primaryLight: '#F59E0B',
    primaryDark: '#92400E',
    gradient: ['#FCD34D', '#F59E0B', '#B45309', '#7C1D0A'],
    ...generateBackground('#D97706'),
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.65)',
    textDisabled: 'rgba(255,255,255,0.30)',
    textOnPrimary: '#FFFFFF',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.25)',
    error: '#EF4444',
    success: '#10B981',
    warning: '#FCD34D',
    overlay: 'rgba(0,0,0,0.75)',
    divider: '#000000',
  },
  thanksgiving: {
    id: 'thanksgiving',
    label: 'Thanksgiving',
    isSeasonal: true,
    seasonalMonth: 11,
    seasonalEmoji: '🦃',
    isAnimated: false,
    primary: '#B45309',
    primaryLight: '#D97706',
    primaryDark: '#92400E',
    gradient: ['#D97706', '#B45309', '#78350F', '#451A03'],
    ...generateBackground('#B45309'),
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.65)',
    textDisabled: 'rgba(255,255,255,0.30)',
    textOnPrimary: '#FFFFFF',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.20)',
    error: '#EF4444',
    success: '#10B981',
    warning: '#D97706',
    overlay: 'rgba(0,0,0,0.75)',
    divider: '#000000',
  },
  christmas: {
    id: 'christmas',
    label: 'Christmas',
    isSeasonal: true,
    seasonalMonth: 12,
    seasonalEmoji: '🎄',
    isAnimated: false,
    primary: '#DC2626',
    primaryLight: '#EF4444',
    primaryDark: '#991B1B',
    gradient: ['#EF4444', '#DC2626', '#15803D', '#166534'],
    ...generateBackground('#DC2626'),
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.65)',
    textDisabled: 'rgba(255,255,255,0.30)',
    textOnPrimary: '#FFFFFF',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.20)',
    error: '#FCA5A5',
    success: '#4ADE80',
    warning: '#C9A84C',
    overlay: 'rgba(0,0,0,0.75)',
    divider: '#000000',
  },
  winter: {
    id: 'winter',
    label: 'Winter',
    isSeasonal: true,
    seasonalMonth: 12,
    seasonalEmoji: '❄️',
    isAnimated: false,
    primary: '#38BDF8',
    primaryLight: '#7DD3FC',
    primaryDark: '#0284C7',
    gradient: ['#E0F2FE', '#7DD3FC', '#38BDF8', '#0C4A6E'],
    ...generateBackground('#38BDF8'),
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.65)',
    textDisabled: 'rgba(255,255,255,0.30)',
    textOnPrimary: '#0C4A6E',
    border: 'rgba(255,255,255,0.10)',
    borderStrong: 'rgba(255,255,255,0.25)',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    overlay: 'rgba(0,0,0,0.75)',
    divider: '#000000',
  },
  newyear: {
    id: 'newyear',
    label: 'New Year',
    isSeasonal: true,
    seasonalMonth: 1,
    seasonalEmoji: '🥂',
    isAnimated: false,
    primary: '#C9A84C',
    primaryLight: '#E8C96C',
    primaryDark: '#A07830',
    gradient: ['#E8C96C', '#C9A84C', '#8B6914', '#4A3800'],
    ...generateBackground('#C9A84C'),
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.65)',
    textDisabled: 'rgba(255,255,255,0.30)',
    textOnPrimary: '#FFFFFF',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.20)',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    overlay: 'rgba(0,0,0,0.75)',
    divider: '#000000',
  },
  custom: {
    id: 'custom',
    label: 'Custom',
    isSeasonal: false,
    primary: '#7C3AED',
    primaryLight: '#8B5CF6',
    primaryDark: '#5B21B6',
    gradient: ['#8B5CF6', '#7C3AED', '#6D28D9', '#4C1D95'],
    ...generateBackground('#7C3AED'),
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.65)',
    textDisabled: 'rgba(255,255,255,0.30)',
    textOnPrimary: '#FFFFFF',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.20)',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    overlay: 'rgba(0,0,0,0.75)',
    divider: '#000000',
  },
};

export const STANDARD_THEMES = Object.values(THEMES)
  .filter(t => !t.isSeasonal && t.id !== 'custom');

export const SEASONAL_THEMES = Object.values(THEMES)
  .filter(t => t.isSeasonal);

export const DEFAULT_THEME = THEMES.purple;

export function getThemeById(id: string): Theme {
  return THEMES[id as ThemeId] ?? DEFAULT_THEME;
}
