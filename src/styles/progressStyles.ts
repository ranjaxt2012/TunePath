import { StyleSheet } from 'react-native';
import { sharedStyles } from './sharedStyles';
import { DesignSystem } from './theme';

export const progressStyles = StyleSheet.create({
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
  // Stats Card Styles
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
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
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: DesignSystem.colors.white,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  divider: {
    width: 1,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: DesignSystem.spacing.lg,
  },
  // Instrument Progress Styles
  instrumentProgressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
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
    color: 'rgba(255, 255, 255, 0.7)',
  },
  progressBarContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
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
    color: 'rgba(255, 255, 255, 0.7)',
  },
  sessionDuration: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
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

export default progressStyles;
