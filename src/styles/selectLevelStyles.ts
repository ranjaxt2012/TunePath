import { StyleSheet } from 'react-native';
import { sharedStyles } from './sharedStyles';
import { DesignSystem } from './theme';

export const selectLevelStyles = StyleSheet.create({
  container: DesignSystem.layout.container,
  backgroundGradient: {
    flex: 1,
    // Gradient background: linear-gradient(135deg, rgba(152, 16, 250, 1) 0%, rgba(173, 70, 255, 1) 50%, rgba(43, 127, 255, 1) 100%)
    backgroundColor: DesignSystem.colors.primary,
  },
  headerContainer: {
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingVertical: DesignSystem.spacing['3xl'],
    alignItems: 'center',
  },
  title: sharedStyles.whiteTitle,
  subtitle: sharedStyles.subtitle,
  levelsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
    gap: DesignSystem.spacing.lg,
  },
  levelCard: {
    width: 150,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: DesignSystem.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  levelHeader: {
    alignItems: 'center',
  },
  levelTitle: {
    fontSize: DesignSystem.typography.fontSizes.base,
    fontWeight: DesignSystem.typography.fontWeights.medium,
    color: DesignSystem.colors.text.primary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.xs,
  },
  levelSubtitle: {
    fontSize: DesignSystem.typography.fontSizes.sm,
    fontWeight: DesignSystem.typography.fontWeights.regular,
    ...sharedStyles.secondaryText,
    textAlign: 'center',
  },
});

export default selectLevelStyles;
