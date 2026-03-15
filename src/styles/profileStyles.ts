import { StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '@/src/constants/theme';

export const profileStyles = StyleSheet.create({
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
    fontSize: 17,
    fontFamily: Typography.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    paddingHorizontal: 4,
  },
  // User Info Card
  userInfoCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.progressBg,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.40)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarIcon: {
    fontSize: 48,
    color: Colors.textPrimary,
  },
  userName: {
    fontSize: 22,
    fontFamily: Typography.semiBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  userInstrument: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  userLevel: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  // Section Card
  sectionCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  // Settings Items
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
    color: Colors.textPrimary,
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsItemValue: {
    fontSize: 15,
    color: Colors.textTertiary,
  },
});

export default profileStyles;
