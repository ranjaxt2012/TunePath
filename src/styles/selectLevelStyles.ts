import { StyleSheet } from 'react-native';
import { sharedStyles } from './sharedStyles';
import { DesignSystem } from './theme';

export const selectLevelStyles = StyleSheet.create({
  // iOS Safe Area Container
  safeAreaContainer: {
    flex: 1,
    backgroundColor: DesignSystem.colors.primary,
  },

  container: DesignSystem.layout.container,
  backgroundGradient: {
    flex: 1,
    // Gradient background: linear-gradient(135deg, rgba(152, 16, 250, 1) 0%, rgba(173, 70, 255, 1) 50%, rgba(43, 127, 255, 1) 100%)
    backgroundColor: DesignSystem.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonContainer: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backIcon: sharedStyles.backIcon,
  backText: sharedStyles.backText,
  headerContainer: {
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingVertical: DesignSystem.spacing['3xl'],
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: DesignSystem.typography.fontSizes['4xl'],
    fontWeight: DesignSystem.typography.fontWeights.medium,
    color: DesignSystem.colors.white,
    textAlign: 'center',
    letterSpacing: DesignSystem.typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: DesignSystem.typography.fontSizes.base,
    fontWeight: DesignSystem.typography.fontWeights.regular,
    color: DesignSystem.colors.white,
    textAlign: 'center',
  },
  levelsContainer: {
    flexDirection: 'column',
    gap: DesignSystem.spacing.lg,
    paddingHorizontal: DesignSystem.spacing.xl,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  levelCard: {
    ...DesignSystem.components.glassCard,
    padding: DesignSystem.spacing.xl,
    width: '100%',
  },
  levelCardSelected: DesignSystem.components.glassCardSelected,
  levelCardUnselected: DesignSystem.components.glassCard,
  levelHeader: {
    alignItems: 'flex-start',
  },
  levelTitle: {
    fontSize: 22,
    fontWeight: DesignSystem.typography.fontWeights.semibold,
    color: DesignSystem.colors.white,
    marginBottom: 4,
  },
  levelSubtitle: {
    fontSize: 15,
    color: DesignSystem.colors.whiteOverlay['70'],
  },
});

export default selectLevelStyles;
