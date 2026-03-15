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

// ── DesignSystem compatibility shim ────────────────────────────────────────
// Consumed by files previously importing from src/styles/theme.
// Maps src/styles/theme token names → src/constants/theme tokens.
export const DesignSystem = {
  colors: {
    primary:      Colors.bgPrimary,
    white:        Colors.white,
    background:   Colors.bgPrimary,
    text: {
      primary:   Colors.textPrimary,
      secondary: Colors.textSecondary,
      light:     Colors.bgPrimary,
    },
    border: {
      light:  'rgba(255,255,255,0.25)',
      medium: 'rgba(255,255,255,0.40)',
      dark:   'rgba(255,255,255,0.60)',
    },
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
  },
  typography: {
    fontFamilies: {
      regular:  Typography.regular,
      medium:   Typography.medium,
      semibold: Typography.semiBold,
      bold:     Typography.bold,
      light:    Typography.regular,
    },
    fontWeights: {
      light:    '300',
      regular:  '400',
      medium:   '500',
      semibold: '600',
      bold:     '700',
    },
    fontSizes: {
      xs:   12,
      sm:   14,
      base: 16,
      lg:   17,
      xl:   18,
      '2xl': 20,
      '3xl': 24,
      '4xl': 28,
    },
    letterSpacing: {
      tight:  -0.5,
      normal: 0,
      wide:   0.5,
    },
  },
  spacing: {
    xs:   Spacing.xs,
    sm:   Spacing.sm,
    md:   Spacing.md,
    lg:   Spacing.lg,
    xl:   Spacing.xl,
    '2xl': Spacing.xxl,
    '3xl': Spacing.xxxl,
    '4xl': 48,
  },
  borderRadius: {
    sm:    Radius.sm,
    md:    Radius.md,
    lg:    Radius.lg,
    xl:    Radius.xl,
    '2xl': Radius.xxl,
    full:  Radius.full,
  },
  components: {
    glassCard:         CommonStyles.card,
    glassCardSelected: CommonStyles.cardSelected,
    card: {
      backgroundColor:   Colors.white,
      borderRadius:       Radius.xl,
      shadowColor:        '#000000',
      shadowOffset:       { width: 0, height: 2 },
      shadowOpacity:      0.1,
      shadowRadius:       8,
      elevation:          4,
    },
    button: {
      primary: {
        backgroundColor:   Colors.bgPrimary,
        borderRadius:       Radius.md,
        paddingVertical:    Spacing.lg,
        paddingHorizontal:  Spacing.xl,
      },
      secondary: {
        backgroundColor:   Colors.white,
        borderWidth:        1,
        borderColor:        'rgba(255,255,255,0.25)',
        borderRadius:       Radius.md,
        paddingVertical:    Spacing.lg,
        paddingHorizontal:  Spacing.xl,
      },
    },
    avatar: {
      small:  { width: 40, height: 40, borderRadius: 20 },
      medium: { width: 60, height: 60, borderRadius: 30 },
      large:  { width: 67, height: 67, borderRadius: 33.5 },
    },
    icon: {
      small:  { width: 20, height: 20, borderRadius: Radius.sm },
      medium: { width: 20, height: 20, borderRadius: Radius.sm },
      large:  { width: 24, height: 24, borderRadius: Radius.sm },
    },
  },
  layout: {
    container: {
      flex: 1,
      backgroundColor: Colors.bgPrimary,
    },
  },
};
