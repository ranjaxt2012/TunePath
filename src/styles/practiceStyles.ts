import { StyleSheet } from 'react-native';
import { sharedStyles } from './sharedStyles';
import { DesignSystem } from './theme';

export const practiceStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.primary,
  },
  headerContainer: {
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingVertical: DesignSystem.spacing['3xl'],
  },
  title: sharedStyles.whiteTitle,
  mainContent: {
    flex: 1,
    paddingHorizontal: DesignSystem.spacing.xl,
  },
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: DesignSystem.colors.white,
  },
  instrumentCardInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  // Lesson Card Styles
  lessonCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
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
    color: 'rgba(255, 255, 255, 0.7)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
  // Bottom Tab Bar (reusing from homeStyles)
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabBarContent: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingVertical: DesignSystem.spacing.sm,
  },
  tabButton: {
    flexDirection: 'column',
    alignItems: 'center',
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
    fontWeight: '500',
    color: DesignSystem.colors.white,
  },
  tabIconInactive: {
    fontSize: 24,
    color: DesignSystem.colors.white,
    opacity: 0.6,
  },
  tabTextInactive: {
    fontSize: 10,
    fontWeight: '500',
    color: DesignSystem.colors.white,
    opacity: 0.6,
  },
});

export default practiceStyles;
