import { StyleSheet } from 'react-native';
import { DesignSystem } from './theme';

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    // Purple gradient background like the web version
    backgroundColor: DesignSystem.colors.primary,
  },
  headerContainer: {
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingTop: DesignSystem.spacing['3xl'],
    flexDirection: 'row',
    alignItems: 'center',
  },
  backArrowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: DesignSystem.spacing.md,
    alignSelf: 'flex-start',
  },
  backArrow: {
    fontSize: 20,
    color: DesignSystem.colors.white,
    fontWeight: '300',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: DesignSystem.spacing.md,
    alignSelf: 'flex-start',
  },
  backIcon: {
    fontSize: 20,
    color: DesignSystem.colors.white,
    fontWeight: '300',
  },
  backText: {
    fontSize: 16,
    color: DesignSystem.colors.white,
  },
  headerContent: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: DesignSystem.spacing['3xl'],
    paddingHorizontal: DesignSystem.spacing.xl,
  },
  welcomeTitle: {
    fontSize: DesignSystem.typography.fontSizes['4xl'],
    fontWeight: DesignSystem.typography.fontWeights.medium,
    color: DesignSystem.colors.white,
    textAlign: 'center',
    letterSpacing: DesignSystem.typography.letterSpacing.tight,
  },
  welcomeSubtitle: {
    fontSize: DesignSystem.typography.fontSizes.base,
    fontWeight: DesignSystem.typography.fontWeights.regular,
    color: DesignSystem.colors.white,
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingBottom: 100, // Space for bottom nav
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  largeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: DesignSystem.spacing.xl,
    marginBottom: DesignSystem.spacing.lg,
    width: '100%',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: DesignSystem.colors.white,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: DesignSystem.spacing.lg,
  },
  primaryButton: {
    backgroundColor: DesignSystem.colors.white,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    width: '100%',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: DesignSystem.colors.primary,
  },
  smallCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: DesignSystem.spacing.lg,
  },
  smallCardTitle: {
    fontSize: 19,
    fontWeight: '600',
    color: DesignSystem.colors.white,
    marginBottom: 2,
  },
  smallCardSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  // Bottom Tab Bar
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
  // Help and Resources
  helpResourcesContainer: {
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingBottom: DesignSystem.spacing.xl,
    alignItems: 'flex-end',
    marginTop: 'auto',
  },
  helpButtonWrapper: {
    position: 'relative',
  },
  helpButton: {
    backgroundColor: 'rgba(128, 128, 128, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.5)',
    borderRadius: 25,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.lg,
    alignItems: 'center',
    width: 50,
    height: 50,
    justifyContent: 'center',
  },
  helpIcon: {
    fontSize: 24,
    color: DesignSystem.colors.white,
    fontWeight: '600',
  },
  hoverLabel: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    alignItems: 'center',
  },
  hoverLabelText: {
    fontSize: 12,
    fontWeight: '500',
    color: DesignSystem.colors.white,
  },
});

export default homeStyles;
