import { StyleSheet } from 'react-native';
import { Spacing, Radius, Typography } from '@/src/constants/theme';
import type { AppTheme } from '@/src/contexts/ThemeContext';

export function createProgressStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.bgPrimary,
    },
    headerContainer: {
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.xxxl,
    },
    title: {
      fontSize: 28,
      fontFamily: Typography.medium,
      color: theme.textPrimary,
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
      color: theme.textPrimary,
      marginBottom: Spacing.lg,
    },
    statsCard: {
      backgroundColor: theme.cardBg,
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
      color: theme.textPrimary,
    },
    statLabel: {
      fontSize: 13,
      color: theme.textSecondary,
    },
    divider: {
      width: 1,
      height: 64,
      backgroundColor: theme.borderColor,
      marginHorizontal: Spacing.lg,
    },
    instrumentProgressCard: {
      backgroundColor: theme.cardBg,
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
      color: theme.textPrimary,
    },
    progressPercentage: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    progressBarContainer: {
      width: '100%',
      backgroundColor: theme.borderColor,
      borderRadius: Radius.full,
      height: 8,
      overflow: 'hidden',
    },
    progressBar: {
      backgroundColor: theme.success,
      height: '100%',
      borderRadius: Radius.full,
    },
    sessionsContainer: {
      gap: Spacing.sm,
    },
    sessionCard: {
      backgroundColor: theme.cardBg,
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
      color: theme.textPrimary,
      marginBottom: 4,
    },
    sessionDate: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    sessionDuration: {
      fontSize: 14,
      fontFamily: Typography.medium,
      color: theme.textPrimary,
    },
  });
}

// For backward compatibility
export const progressStyles = createProgressStyles({ textPrimary: '#FFFFFF' } as any);
export default progressStyles;
