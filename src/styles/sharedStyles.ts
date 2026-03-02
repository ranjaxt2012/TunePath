import { StyleSheet } from 'react-native';
import { DesignSystem } from './theme';

// Shared reusable styles to eliminate duplication
export const sharedStyles = StyleSheet.create({
  // Common card patterns
  card: DesignSystem.components.card,
  
  // Common text patterns
  title: {
    fontSize: DesignSystem.typography.fontSizes['3xl'],
    fontWeight: DesignSystem.typography.fontWeights.semibold,
    color: DesignSystem.colors.text.primary,
    letterSpacing: DesignSystem.typography.letterSpacing.tight,
  },
  whiteTitle: {
    fontSize: DesignSystem.typography.fontSizes['4xl'],
    fontWeight: DesignSystem.typography.fontWeights.medium,
    color: DesignSystem.colors.white,
    textAlign: 'center',
    letterSpacing: DesignSystem.typography.letterSpacing.tight,
  },
  
  subtitle: {
    fontSize: DesignSystem.typography.fontSizes.base,
    fontWeight: DesignSystem.typography.fontWeights.regular,
    color: DesignSystem.colors.text.secondary,
  },
  
  // Common button patterns
  primaryButton: DesignSystem.components.button.primary,
  secondaryButton: DesignSystem.components.button.secondary,
  
  // Common icon patterns
  iconSmall: DesignSystem.components.icon.small,
  iconMedium: DesignSystem.components.icon.medium,
  iconLarge: DesignSystem.components.icon.large,
  
  // Common avatar patterns
  avatarSmall: DesignSystem.components.avatar.small,
  avatarMedium: DesignSystem.components.avatar.medium,
  avatarLarge: DesignSystem.components.avatar.large,
  
  // Common layout patterns
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Common list patterns
  listItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: DesignSystem.spacing.lg,
    paddingHorizontal: DesignSystem.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  
  // Common spacing utilities
  smallMargin: {
    marginVertical: DesignSystem.spacing.sm,
  },
  mediumMargin: {
    marginVertical: DesignSystem.spacing.md,
  },
  largeMargin: {
    marginVertical: DesignSystem.spacing.lg,
  },
  
  // Screen layout (shared by practice, profile, progress tab screens)
  screenContainer: {
    flex: 1,
    backgroundColor: DesignSystem.colors.primary,
  },
  screenHeaderContainer: {
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingVertical: DesignSystem.spacing['3xl'],
  },
  screenMainContent: {
    flex: 1,
    paddingHorizontal: DesignSystem.spacing.xl,
  },

  // Glass card (white-10% bg, white-20% border, radius 20)
  glassCard: DesignSystem.components.glassCard,

  // Back button icon & text (shared across all screens)
  backIcon: {
    fontSize: 20,
    color: DesignSystem.colors.white,
    fontWeight: '300' as const,
  },
  backText: {
    fontSize: 16,
    color: DesignSystem.colors.white,
  },

  // Bottom tab bar (shared across all tab screens)
  bottomTabBar: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: DesignSystem.colors.whiteOverlay['10'],
    borderTopWidth: 1,
    borderTopColor: DesignSystem.colors.whiteOverlay['20'],
  },
  tabBarContent: {
    alignSelf: 'center' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-around' as const,
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingVertical: DesignSystem.spacing.sm,
  },
  tabButton: {
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingVertical: DesignSystem.spacing.sm,
    paddingHorizontal: DesignSystem.spacing.md,
  },
  tabIconActive: {
    fontSize: 24,
    color: DesignSystem.colors.white,
  },
  tabTextActive: {
    fontSize: 10,
    fontWeight: '500' as const,
    color: DesignSystem.colors.white,
  },
  tabIconInactive: {
    fontSize: 24,
    color: DesignSystem.colors.white,
    opacity: 0.6,
  },
  tabTextInactive: {
    fontSize: 10,
    fontWeight: '500' as const,
    color: DesignSystem.colors.white,
    opacity: 0.6,
  },

  // Help button — matches tab icon+label style, absolutely anchored to bottom-right
  helpButtonWrapper: {
    position: 'absolute' as const,
    bottom: 0,
    right: 0,
  },
  helpButton: {
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingVertical: DesignSystem.spacing.sm,
    paddingHorizontal: DesignSystem.spacing.md,
  },
  helpLabel: {
    fontSize: 10,
    fontWeight: '500' as const,
    color: DesignSystem.colors.white,
    opacity: 0.6,
  },
  hoverLabel: {
    position: 'absolute' as const,
    bottom: 56,
    right: DesignSystem.spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    minWidth: 120,
    alignItems: 'center' as const,
  },
  hoverLabelText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: DesignSystem.colors.white,
  },

  // Common background patterns
  primaryBackground: {
    backgroundColor: DesignSystem.colors.primary,
  },
  
  whiteBackground: {
    backgroundColor: DesignSystem.colors.white,
  },
  
  // Common text colors
  primaryText: {
    color: DesignSystem.colors.text.primary,
  },
  
  secondaryText: {
    color: DesignSystem.colors.text.secondary,
  },
  
  lightText: {
    color: DesignSystem.colors.text.light,
  },
  
  whiteText: {
    color: DesignSystem.colors.white,
  },
});

export default sharedStyles;
