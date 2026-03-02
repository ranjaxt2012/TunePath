import { StyleSheet } from 'react-native';
import { sharedStyles } from './sharedStyles';
import { DesignSystem } from './theme';

export const practiceStyles = StyleSheet.create({
  container: sharedStyles.screenContainer,
  headerContainer: sharedStyles.screenHeaderContainer,
  title: sharedStyles.whiteTitle,
  mainContent: sharedStyles.screenMainContent,
  section: {
    marginBottom: DesignSystem.spacing.xl,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: DesignSystem.colors.white,
    marginBottom: DesignSystem.spacing.lg,
  },
  instrumentsScroll: {
    flexDirection: 'row',
  },
  // Instrument Card Styles
  instrumentCard: {
    width: 128,
    padding: DesignSystem.spacing.md,
    borderRadius: 20,
    marginHorizontal: DesignSystem.spacing.xs,
  },
  instrumentCardActive: {
    backgroundColor: DesignSystem.colors.whiteOverlay['20'],
    borderWidth: 2,
    borderColor: DesignSystem.colors.white,
  },
  instrumentCardInactive: {
    backgroundColor: DesignSystem.colors.whiteOverlay['10'],
    borderWidth: 1,
    borderColor: DesignSystem.colors.whiteOverlay['20'],
  },
  instrumentCardContent: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  instrumentIcon: {
    fontSize: 32,
    color: DesignSystem.colors.white,
  },
  instrumentName: {
    fontSize: 15,
    fontWeight: '600',
    color: DesignSystem.colors.white,
    textAlign: 'center',
  },
  instrumentLevel: {
    fontSize: 13,
    color: DesignSystem.colors.whiteOverlay['70'],
    textAlign: 'center',
  },
  // Lesson Card Styles
  lessonCard: {
    ...DesignSystem.components.glassCard,
    padding: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.md,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: DesignSystem.spacing.sm,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: DesignSystem.colors.white,
    marginBottom: 4,
  },
  lessonDuration: {
    fontSize: 14,
    color: DesignSystem.colors.whiteOverlay['70'],
  },
  startButton: {
    backgroundColor: DesignSystem.colors.white,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: 8,
    borderRadius: 14,
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: DesignSystem.colors.primary,
  },
  progressBarContainer: {
    width: '100%',
    backgroundColor: DesignSystem.colors.whiteOverlay['20'],
    borderRadius: 8,
    height: 6,
    overflow: 'hidden',
  },
  progressBar: {
    backgroundColor: DesignSystem.colors.white,
    height: '100%',
    borderRadius: 8,
  },
  lessonsContainer: {
    gap: DesignSystem.spacing.sm,
  },
});

export default practiceStyles;
