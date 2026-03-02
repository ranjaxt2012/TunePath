import { StyleSheet } from 'react-native';
import { sharedStyles } from './sharedStyles';
import { DesignSystem } from './theme';

export const selectInstrumentStyles = StyleSheet.create({
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
  instrumentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
    gap: DesignSystem.spacing.lg,
  },
  instrumentCard: {
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
  iconContainer: sharedStyles.smallMargin,
  instrumentIcon: {
    fontSize: 32,
  },
  instrumentName: {
    fontSize: DesignSystem.typography.fontSizes.base,
    fontWeight: DesignSystem.typography.fontWeights.medium,
    ...sharedStyles.primaryText,
    textAlign: 'center',
  },
});

export default selectInstrumentStyles;
