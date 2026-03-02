import { StyleSheet } from 'react-native';
import { sharedStyles } from './sharedStyles';
import { DesignSystem } from './theme';

export const progressStyles = StyleSheet.create({
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
  // Stats Card Styles
  statsCard: {
    ...DesignSystem.components.glassCard,
    padding: DesignSystem.spacing.xl,
    marginBottom: DesignSystem.spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statCard: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    fontSize: 28,
    color: DesignSystem.colors.whiteOverlay['80'],
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: DesignSystem.colors.white,
  },
  statLabel: {
    fontSize: 13,
    color: DesignSystem.colors.whiteOverlay['70'],
  },
  divider: {
    width: 1,
    height: 64,
    backgroundColor: DesignSystem.colors.whiteOverlay['20'],
    marginHorizontal: DesignSystem.spacing.lg,
  },
  // Instrument Progress Styles
  instrumentProgressCard: {
    ...DesignSystem.components.glassCard,
    padding: DesignSystem.spacing.lg,
  },
  instrumentProgress: {
    marginBottom: DesignSystem.spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: DesignSystem.spacing.sm,
  },
  instrumentName: {
    fontSize: 15,
    fontWeight: '500',
    color: DesignSystem.colors.white,
  },
  progressPercentage: {
    fontSize: 14,
    color: DesignSystem.colors.whiteOverlay['70'],
  },
  progressBarContainer: {
    width: '100%',
    backgroundColor: DesignSystem.colors.whiteOverlay['20'],
    borderRadius: 8,
    height: 8,
    overflow: 'hidden',
  },
  progressBar: {
    backgroundColor: DesignSystem.colors.white,
    height: '100%',
    borderRadius: 8,
  },
  // Session Card Styles
  sessionsContainer: {
    gap: DesignSystem.spacing.sm,
  },
  sessionCard: {
    ...DesignSystem.components.glassCard,
    padding: DesignSystem.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignSystem.colors.white,
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 14,
    color: DesignSystem.colors.whiteOverlay['70'],
  },
  sessionDuration: {
    fontSize: 14,
    fontWeight: '500',
    color: DesignSystem.colors.whiteOverlay['90'],
  },
  // Bottom Tab Bar
  bottomTabBar: sharedStyles.bottomTabBar,
  tabBarContent: sharedStyles.tabBarContent,
  tabButton: sharedStyles.tabButton,
  tabIconActive: sharedStyles.tabIconActive,
  tabTextActive: sharedStyles.tabTextActive,
  tabIconInactive: sharedStyles.tabIconInactive,
  tabTextInactive: sharedStyles.tabTextInactive,
});

export default progressStyles;
