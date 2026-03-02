import { StyleSheet } from 'react-native';
import { sharedStyles } from './sharedStyles';
import { DesignSystem } from './theme';

export const selectInstrumentStyles = StyleSheet.create({
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
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.xl,
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
  title: sharedStyles.whiteTitle,
  subtitle: {
    fontSize: DesignSystem.typography.fontSizes.base,
    fontWeight: DesignSystem.typography.fontWeights.regular,
    color: DesignSystem.colors.white,
    textAlign: 'center',
  },
  instrumentsContainer: {
    flexDirection: 'column',
    gap: DesignSystem.spacing.lg,
  },
  instrumentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: DesignSystem.spacing.lg,
  },
  instrumentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
    gap: DesignSystem.spacing.lg,
  },
  instrumentCard: {
    width: 150,
    height: 120,
    ...DesignSystem.components.glassCard,
    borderRadius: DesignSystem.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: sharedStyles.smallMargin,
  instrumentIcon: {
    fontSize: 32,
  },
  instrumentName: {
    fontSize: DesignSystem.typography.fontSizes.base,
    fontWeight: DesignSystem.typography.fontWeights.medium,
    color: DesignSystem.colors.white,
    textAlign: 'center',
  },
});

export default selectInstrumentStyles;
