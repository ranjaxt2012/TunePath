// TunePath Design System
// Centralized styling for consistent design across all screens
// All token maps are frozen with `as const` so TypeScript infers literal types.
// Use the exported ThemeXxx types to enforce boundaries in components & styles.

// Base design tokens
const colors = {
  primary: '#9810FA',
  background: '#F5F5F5',
  white: '#FFFFFF',
  text: {
    primary: '#1A1A1A',
    secondary: '#666666',
    light: '#9810FA',
  },
  border: {
    light: '#E5E7EB',
    medium: 'rgba(0, 0, 0, 0.1)',
    dark: 'rgba(0, 0, 0, 0.2)',
  },
  shadow: {
    color: '#000000',
    offset: { width: 0, height: 2 },
    opacity: 0.1,
    radius: 8,
    elevation: 4,
  },
  // White overlay tokens for glass UI on primary background
  whiteOverlay: {
    '10': 'rgba(255, 255, 255, 0.1)',
    '15': 'rgba(255, 255, 255, 0.15)',
    '20': 'rgba(255, 255, 255, 0.2)',
    '30': 'rgba(255, 255, 255, 0.3)',
    '40': 'rgba(255, 255, 255, 0.4)',
    '50': 'rgba(255, 255, 255, 0.5)',
    '60': 'rgba(255, 255, 255, 0.6)',
    '70': 'rgba(255, 255, 255, 0.7)',
    '80': 'rgba(255, 255, 255, 0.8)',
    '90': 'rgba(255, 255, 255, 0.9)',
  },
} as const;

const typography = {
  fontFamily: 'Inter',
  fontWeights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 17,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
} as const;

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
} as const;

const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

// Component styles using base tokens
const components = {
  // Glass card — standard frosted card on primary background
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  // Glass card selected state
  glassCardSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  // Segmented / overlay surface (slightly brighter)
  glassSurface: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius['2xl'],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  button: {
    primary: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
    },
    secondary: {
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: borderRadius.md,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
    },
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  avatar: {
    small: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    medium: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    large: {
      width: 67,
      height: 67,
      borderRadius: 33.5,
    },
  },
  icon: {
    small: {
      width: 16,
      height: 16,
      borderRadius: borderRadius.sm,
    },
    medium: {
      width: 20,
      height: 20,
      borderRadius: borderRadius.sm,
    },
    large: {
      width: 24,
      height: 24,
      borderRadius: borderRadius.sm,
    },
  },
};

// Layout patterns using base tokens
const layout = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  section: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.xl,
    borderRadius: borderRadius['2xl'],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
};

export const DesignSystem = {
  colors,
  typography,
  spacing,
  borderRadius,
  components,
  layout,
};

// ---------------------------------------------------------------------------
// Derived token types — import these in components to stay within boundaries
// ---------------------------------------------------------------------------

/** All valid spacing keys: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' */
export type ThemeSpacing = keyof typeof spacing;

/** All valid border-radius keys: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' */
export type ThemeBorderRadius = keyof typeof borderRadius;

/** All valid font-size keys: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' */
export type ThemeFontSize = keyof typeof typography.fontSizes;

/** All valid font-weight keys: 'light' | 'regular' | 'medium' | 'semibold' | 'bold' */
export type ThemeFontWeight = keyof typeof typography.fontWeights;

/** All valid white-overlay keys: '10' | '15' | '20' | '30' | '40' | '50' | '60' | '70' | '80' | '90' */
export type ThemeWhiteOverlay = keyof typeof colors.whiteOverlay;

/** Resolved spacing value (number) */
export type ThemeSpacingValue = (typeof spacing)[ThemeSpacing];

/** Resolved font-size value (number) */
export type ThemeFontSizeValue = (typeof typography.fontSizes)[ThemeFontSize];

/** Button variant keys */
export type ThemeButtonVariant = keyof typeof components.button;

// ---------------------------------------------------------------------------
// Helper functions — all params are typed to token keys, not raw primitives
// ---------------------------------------------------------------------------

export const createTextStyle = (
  size: ThemeFontSize,
  weight: ThemeFontWeight = 'regular',
  color: string = DesignSystem.colors.text.primary,
) => ({
  fontFamily: DesignSystem.typography.fontFamily,
  fontSize: DesignSystem.typography.fontSizes[size],
  fontWeight: DesignSystem.typography.fontWeights[weight],
  color,
});

export const createButtonStyle = (
  variant: ThemeButtonVariant = 'primary',
  pressed: boolean = false,
) => ({
  ...DesignSystem.components.button[variant],
  opacity: pressed ? 0.8 : 1,
});

export const createCardStyle = (additionalStyles: Record<string, unknown> = {}) => ({
  ...DesignSystem.components.card,
  ...additionalStyles,
});

/** Resolve a spacing token to its pixel value */
export const sp = (key: ThemeSpacing): number => spacing[key];

/** Resolve a border-radius token to its pixel value */
export const br = (key: ThemeBorderRadius): number => borderRadius[key];

/** Resolve a font-size token to its pixel value */
export const fs = (key: ThemeFontSize): number => typography.fontSizes[key];

export default DesignSystem;
