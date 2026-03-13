import { StyleSheet } from 'react-native';
import { sharedStyles } from './sharedStyles';
import { DesignSystem } from './theme';

export const welcomeStyles = StyleSheet.create({
  container: DesignSystem.layout.container,
  backgroundGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: sharedStyles.largeMargin,
  logoCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoIcon: {
    fontSize: DesignSystem.typography.fontSizes['4xl'],
    fontWeight: DesignSystem.typography.fontWeights.light,
    ...sharedStyles.whiteText,
  },
  titleContainer: sharedStyles.mediumMargin,
  title: sharedStyles.whiteTitle,
  subtitleContainer: sharedStyles.largeMargin,
  subtitle: {
    fontSize: DesignSystem.typography.fontSizes.base,
    fontWeight: DesignSystem.typography.fontWeights.regular,
    ...sharedStyles.whiteText,
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: DesignSystem.spacing.lg + DesignSystem.spacing.sm, // 24px
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    width: 384,
    height: 60,
    borderRadius: DesignSystem.borderRadius.xl,
    ...sharedStyles.whiteBackground,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 12,
  },
  buttonText: {
    fontSize: DesignSystem.typography.fontSizes.base,
    fontWeight: DesignSystem.typography.fontWeights.semibold,
    color: DesignSystem.colors.primary,
    textAlign: 'center',
  },
});

export default welcomeStyles;
