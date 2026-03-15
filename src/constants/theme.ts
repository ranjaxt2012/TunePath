import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BASE_PADDING = 16;
export const CONTENT_WIDTH = Math.min(SCREEN_WIDTH - BASE_PADDING * 2, 390);

// ── Colors ─────────────────────────────────────────────────────────────────
export const Colors = {
  gradientTop:      '#7C3AED',
  gradientBottom:   '#5B21B6',
  bgPrimary:        '#7C3AED',
  cardBg:           'rgba(255,255,255,0.12)',
  cardBgHover:      'rgba(255,255,255,0.20)',
  cardBgSelected:   'rgba(255,255,255,0.25)',
  cardBorder:       'rgba(255,255,255,0.25)',
  cardBorderStrong: 'rgba(255,255,255,0.60)',
  bannerBg:         'rgba(0,0,0,0.30)',
  bannerOverlay:    'rgba(0,0,0,0.50)',
  textPrimary:      '#FFFFFF',
  textSecondary:    'rgba(255,255,255,0.75)',
  textTertiary:     'rgba(255,255,255,0.50)',
  textDisabled:     'rgba(255,255,255,0.30)',
  accentLight:      '#DDD6FE',
  accentWhite:      '#FFFFFF',
  progressBg:       'rgba(255,255,255,0.20)',
  progressFill:     '#FFFFFF',
  tabActive:        '#FFFFFF',
  tabInactive:      'rgba(255,255,255,0.50)',
  tabBarBg:         '#5B21B6',
  success:          '#10B981',
  warning:          '#F59E0B',
  error:            '#EF4444',
  white:            '#FFFFFF',
  black:            '#000000',
  transparent:      'transparent',
};

// ── Gradient (bright purple top → deep purple bottom) ───────────────────────
export const Gradient = {
  colors: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6'] as const,
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
};

// ── Spacing ────────────────────────────────────────────────────────────────
export const Spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  xxl:  32,
  xxxl: 48,
};

// ── Border radius ──────────────────────────────────────────────────────────
export const Radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  xxl:  32,
  full: 999,
};

// ── Typography — single source of truth for font families (theme.ts only) ───
export const Typography = {
  regular:  'Inter_400Regular',
  medium:   'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold:     'Inter_700Bold',
  mono:     'SpaceMono',
} as const;

export const FontSize = {
  xs:   11,
  sm:   13,
  md:   15,
  lg:   17,
  xl:   20,
  xxl:  24,
  hero: 30,
} as const;

export const LineHeight = {
  tight:  1.2,
  normal: 1.5,
  loose:  1.8,
} as const;

/** Compound text presets — use Typography + FontSize, no hardcoded font names */
export const TextPresets = {
  displayLg: { fontSize: FontSize.hero, fontFamily: Typography.bold, letterSpacing: -0.3 },
  displayMd: { fontSize: FontSize.xxl, fontFamily: Typography.bold, letterSpacing: -0.3 },
  displaySm: { fontSize: FontSize.xl, fontFamily: Typography.bold, letterSpacing: -0.3 },
  h1:        { fontSize: FontSize.xl, fontFamily: Typography.bold, letterSpacing: -0.3 },
  h2:        { fontSize: FontSize.lg, fontFamily: Typography.semiBold },
  h3:        { fontSize: FontSize.md, fontFamily: Typography.semiBold },
  bodyLg:    { fontSize: FontSize.md, fontFamily: Typography.regular },
  bodyMd:    { fontSize: FontSize.sm, fontFamily: Typography.regular },
  bodySm:    { fontSize: FontSize.xs, fontFamily: Typography.regular },
  labelLg:   { fontSize: FontSize.md, fontFamily: Typography.semiBold },
  labelMd:   { fontSize: FontSize.sm, fontFamily: Typography.semiBold },
  labelSm:   { fontSize: FontSize.xs, fontFamily: Typography.semiBold },
  caption:   { fontSize: FontSize.xs, fontFamily: Typography.regular },
};

// ── Layout ─────────────────────────────────────────────────────────────────
export const Layout = {
  screenWidth:        SCREEN_WIDTH,
  screenHeight:       SCREEN_HEIGHT,
  contentWidth:       CONTENT_WIDTH,
  basePadding:        BASE_PADDING,
  cardFull:           SCREEN_WIDTH - BASE_PADDING * 2,
  cardHalf:           (SCREEN_WIDTH - BASE_PADDING * 2 - Spacing.md) / 2,
  cardThird:          (SCREEN_WIDTH - BASE_PADDING * 2 - Spacing.md * 2) / 3,
  featuredHeight:     220,
  rowCardWidth:       160,
  rowCardHeight:      100,
  continueCardWidth:  200,
  continueCardHeight: 120,
  tabBarHeight:       60,
  buttonHeight:       52,
  inputHeight:        52,
  isSmallScreen:      SCREEN_HEIGHT < 700,
};

// ── Shadows ────────────────────────────────────────────────────────────────
export const Shadows = {
  sm: Platform.select({
    ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
               shadowOpacity: 0.15, shadowRadius: 4 },
    android: { elevation: 2 },
  }),
  md: Platform.select({
    ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
               shadowOpacity: 0.20, shadowRadius: 8 },
    android: { elevation: 4 },
  }),
  lg: Platform.select({
    ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
               shadowOpacity: 0.25, shadowRadius: 16 },
    android: { elevation: 8 },
  }),
};

// ── Reusable style objects ─────────────────────────────────────────────────
export const CommonStyles = {
  screen: {
    flex: 1,
    // backgroundColor removed — use ScreenGradient for gradient background
  },
  scrollContent: {
    paddingBottom: 100,
  },
  padded: {
    paddingHorizontal: BASE_PADDING,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  cardSelected: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.60)',
  },
  primaryButton: {
    height: Layout.buttonHeight,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.full,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  primaryButtonText: {
    fontSize: FontSize.md,
    fontFamily: Typography.semiBold,
    color: '#7C3AED',
  },
  ghostButton: {
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.full,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: Spacing.lg,
  },
  ghostButtonText: {
    fontSize: FontSize.sm,
    fontFamily: Typography.semiBold,
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: Spacing.md,
    paddingHorizontal: BASE_PADDING,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontFamily: Typography.bold,
    color: '#FFFFFF',
  },
  sectionLink: {
    fontSize: FontSize.sm,
    fontFamily: Typography.medium,
    color: 'rgba(255,255,255,0.70)',
  },
};
