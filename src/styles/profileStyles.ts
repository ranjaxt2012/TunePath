import { StyleSheet } from 'react-native';
import { sharedStyles } from './sharedStyles';
import { DesignSystem } from './theme';

export const profileStyles = StyleSheet.create({
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
    fontSize: 17,
    fontWeight: '600',
    color: DesignSystem.colors.white,
    marginBottom: DesignSystem.spacing.md,
    paddingHorizontal: 4,
  },
  // User Info Card Styles
  userInfoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: DesignSystem.spacing.xl,
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
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
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  userLevel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  // Section Card Styles
  sectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    color: 'rgba(255, 255, 255, 0.8)',
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
    color: 'rgba(255, 255, 255, 0.6)',
  },
  chevron: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.4)',
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

export default profileStyles;
