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

// ── Typography — colors NOT included, add per-style explicitly ─────────────
export const Typography = {
  displayLg: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  displayMd: { fontSize: 26, fontWeight: '700' as const, letterSpacing: -0.3 },
  displaySm: { fontSize: 22, fontWeight: '700' as const },
  h1:        { fontSize: 20, fontWeight: '700' as const },
  h2:        { fontSize: 17, fontWeight: '600' as const },
  h3:        { fontSize: 15, fontWeight: '600' as const },
  bodyLg:    { fontSize: 16, fontWeight: '400' as const },
  bodyMd:    { fontSize: 14, fontWeight: '400' as const },
  bodySm:    { fontSize: 12, fontWeight: '400' as const },
  labelLg:   { fontSize: 15, fontWeight: '600' as const },
  labelMd:   { fontSize: 13, fontWeight: '600' as const },
  labelSm:   { fontSize: 11, fontWeight: '600' as const },
  caption:   { fontSize: 11, fontWeight: '400' as const },
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
    fontSize: 15,
    fontWeight: '600' as const,
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
    fontSize: 14,
    fontWeight: '600' as const,
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
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.70)',
  },
};
