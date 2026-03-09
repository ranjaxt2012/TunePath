import { StyleSheet } from 'react-native';
import { sharedStyles } from './sharedStyles';
import { DesignSystem } from './theme';

export const selectLessonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.primary,
  },
  backButtonContainer: {
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingTop: DesignSystem.spacing['3xl'],
    paddingBottom: DesignSystem.spacing.sm,
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
    paddingBottom: DesignSystem.spacing.xl,
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
  lessonsContainer: {
    flex: 1,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  lessonsContent: {
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingTop: DesignSystem.spacing.sm,
    paddingBottom: DesignSystem.spacing['3xl'],
    gap: DesignSystem.spacing.lg,
  },
  lessonCard: {
    ...DesignSystem.components.glassCard,
    padding: DesignSystem.spacing.xl,
    width: '100%',
  },
  lessonHeader: {
    alignItems: 'flex-start',
  },
  lessonTitle: {
    fontSize: 22,
    fontWeight: DesignSystem.typography.fontWeights.semibold,
    color: DesignSystem.colors.white,
    marginBottom: 4,
  },
  lessonSubtitle: {
    fontSize: 15,
    color: DesignSystem.colors.whiteOverlay['70'],
  },
  continueButton: {
    marginTop: DesignSystem.spacing.lg,
    backgroundColor: DesignSystem.colors.white,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: DesignSystem.colors.primary,
  },
});

export default selectLessonStyles;
