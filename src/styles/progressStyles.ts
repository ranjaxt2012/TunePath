import { StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '@/src/constants/theme';

export const progressStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  headerContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
  },
  title: {
    fontSize: 28,
    fontFamily: Typography.medium,
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: Typography.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  // Stats Card
  statsCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
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
    color: 'rgba(255,255,255,0.80)',
  },
  statValue: {
    fontSize: 24,
    fontFamily: Typography.semiBold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  divider: {
    width: 1,
    height: 64,
    backgroundColor: Colors.progressBg,
    marginHorizontal: Spacing.lg,
  },
  // Instrument Progress
  instrumentProgressCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  instrumentProgress: {
    marginBottom: Spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  instrumentName: {
    fontSize: 15,
    fontFamily: Typography.medium,
    color: Colors.textPrimary,
  },
  progressPercentage: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  progressBarContainer: {
    width: '100%',
    backgroundColor: Colors.progressBg,
    borderRadius: Radius.full,
    height: 8,
    overflow: 'hidden',
  },
  progressBar: {
    backgroundColor: Colors.progressFill,
    height: '100%',
    borderRadius: Radius.full,
  },
  // Session Cards
  sessionsContainer: {
    gap: Spacing.sm,
  },
  sessionCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontFamily: Typography.semiBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sessionDuration: {
    fontSize: 14,
    fontFamily: Typography.medium,
    color: Colors.textPrimary,
  },
});

export default progressStyles;
