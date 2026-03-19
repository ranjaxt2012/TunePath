import { StyleSheet } from 'react-native';
import { Spacing, Radius, Typography } from '@/src/constants/theme';
import type { AppTheme } from '@/src/contexts/ThemeContext';

export function createProfileStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
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
      fontSize: 17,
      fontFamily: Typography.semiBold,
      color: theme.textPrimary,
      marginBottom: Spacing.md,
      paddingHorizontal: 4,
    },
    userInfoCard: {
      backgroundColor: theme.cardBg,
      borderRadius: Radius.lg,
      padding: Spacing.xl,
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    avatar: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: theme.borderColor,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.40)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
    },
    avatarIcon: {
      fontSize: 48,
      color: theme.textPrimary,
    },
    userName: {
      fontSize: 22,
      fontFamily: Typography.semiBold,
      color: theme.textPrimary,
      marginBottom: 4,
    },
    userInstrument: {
      fontSize: 15,
      color: theme.textSecondary,
      marginBottom: 2,
    },
    userLevel: {
      fontSize: 14,
      color: theme.textDisabled,
    },
    sectionCard: {
      backgroundColor: theme.cardBg,
      borderRadius: Radius.lg,
      overflow: 'hidden',
    },
    divider: {
      height: 1,
      backgroundColor: 'rgba(255,255,255,0.10)',
    },
    settingsItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: Spacing.md,
    },
    settingsItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    settingsItemIcon: {},
    settingsItemLabel: {
      fontSize: 16,
      fontFamily: Typography.medium,
      color: theme.textPrimary,
    },
    settingsItemRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    settingsItemValue: {
      fontSize: 15,
      color: theme.textDisabled,
    },
    themesContainer: {
      backgroundColor: theme.cardBg,
      borderRadius: Radius.lg,
      padding: Spacing.lg,
    },
    themesGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: Spacing.md,
      flexWrap: 'wrap',
    },
    themeSwatch: {
      width: 50,
      height: 50,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
    },
    themeSwatchActive: {
      borderWidth: 3,
      borderColor: theme.textPrimary,
    },
    themeLabel: {
      fontSize: 12,
      fontFamily: Typography.semiBold,
      color: theme.textSecondary,
      marginTop: Spacing.sm,
      textAlign: 'center',
    },
    genresPill: {
      backgroundColor: theme.cardBgHover,
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      marginRight: Spacing.sm,
      marginBottom: Spacing.sm,
    },
    genresPillText: {
      fontSize: 13,
      fontFamily: Typography.medium,
      color: theme.textPrimary,
    },
    genresContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginVertical: Spacing.sm,
    },
    signOutButton: {
      backgroundColor: 'rgba(239,68,68,0.20)',
      borderRadius: Radius.full,
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.xl,
      alignItems: 'center',
      marginVertical: Spacing.xl,
    },
    signOutButtonText: {
      fontSize: 16,
      fontFamily: Typography.semiBold,
      color: '#EF4444',
    },
  });
}

// For backward compatibility
export const profileStyles = createProfileStyles({ textPrimary: '#FFFFFF' } as any);
export default profileStyles;
