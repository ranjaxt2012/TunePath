import { StyleSheet } from 'react-native';
import { sharedStyles } from './sharedStyles';
import { DesignSystem } from './theme';

export const profileStyles = StyleSheet.create({
  container: sharedStyles.screenContainer,
  headerContainer: sharedStyles.screenHeaderContainer,
  title: sharedStyles.whiteTitle,
  mainContent: sharedStyles.screenMainContent,
  section: {
    marginBottom: DesignSystem.spacing.xl,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: DesignSystem.colors.white,
    marginBottom: DesignSystem.spacing.md,
    paddingHorizontal: 4,
  },
  // User Info Card Styles
  userInfoCard: {
    ...DesignSystem.components.glassCard,
    padding: DesignSystem.spacing.xl,
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: DesignSystem.colors.whiteOverlay['20'],
    borderWidth: 2,
    borderColor: DesignSystem.colors.whiteOverlay['40'],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing.md,
  },
  avatarIcon: {
    fontSize: 48,
    color: DesignSystem.colors.white,
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    color: DesignSystem.colors.white,
    marginBottom: 4,
  },
  userInstrument: {
    fontSize: 15,
    color: DesignSystem.colors.whiteOverlay['70'],
    marginBottom: 2,
  },
  userLevel: {
    fontSize: 14,
    color: DesignSystem.colors.whiteOverlay['60'],
  },
  // Section Card Styles
  sectionCard: {
    ...DesignSystem.components.glassCard,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: DesignSystem.colors.whiteOverlay['10'],
  },
  // Settings Item Styles
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: DesignSystem.spacing.md,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsItemIcon: {
    fontSize: 20,
    color: DesignSystem.colors.whiteOverlay['80'],
  },
  settingsItemLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: DesignSystem.colors.white,
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsItemValue: {
    fontSize: 15,
    color: DesignSystem.colors.whiteOverlay['60'],
  },
  chevron: {
    fontSize: 20,
    color: DesignSystem.colors.whiteOverlay['40'],
  },
});

export default profileStyles;
