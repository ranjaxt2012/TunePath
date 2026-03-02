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
