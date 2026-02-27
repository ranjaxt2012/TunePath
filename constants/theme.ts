import '@/global.css';
import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    // Add your Figma colors here
    primary: '#007AFF',      // Figma primary blue
    secondary: '#5856D6',    // Figma secondary purple
    accent: '#FF9500',       // Figma accent orange
    success: '#34C759',      // Figma success green
    warning: '#FF9500',      // Figma warning yellow
    error: '#FF3B30',        // Figma error red
    border: '#E5E5EA',       // Figma border color
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
    // Dark mode variants from Figma
    primary: '#0A84FF',      // Figma primary blue (dark)
    secondary: '#5E5CE6',    // Figma secondary purple (dark)
    accent: '#FF9F0A',       // Figma accent orange (dark)
    success: '#30D158',      // Figma success green (dark)
    warning: '#FF9F0A',      // Figma warning yellow (dark)
    error: '#FF453A',        // Figma error red (dark)
    border: '#38383A',       // Figma border color (dark)
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Typography = {
  heading1: { fontSize: 32, fontWeight: '700' as const },
  heading2: { fontSize: 24, fontWeight: '600' as const },
  heading3: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  small: { fontSize: 14, fontWeight: '400' as const },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
