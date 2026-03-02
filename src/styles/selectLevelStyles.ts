import { StyleSheet } from 'react-native';
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
  backIcon: {
    fontSize: 20,
    color: DesignSystem.colors.white,
    fontWeight: '300',
  },
  backText: {
    fontSize: 16,
    color: DesignSystem.colors.white,
  },
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: DesignSystem.spacing.xl,
    width: '100%',
  },
  levelCardSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  levelCardUnselected: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
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
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

export default selectLevelStyles;
