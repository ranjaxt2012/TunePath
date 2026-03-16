import { StyleSheet } from 'react-native';
import { sharedStyles } from './sharedStyles';
import { DesignSystem } from '@/src/constants/theme';

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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: DesignSystem.spacing.md,
    alignSelf: 'flex-start',
  },
  backIcon: sharedStyles.backIcon,
  backText: sharedStyles.backText,
  headerContent: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: DesignSystem.spacing['3xl'],
    paddingHorizontal: DesignSystem.spacing.xl,
  },
  welcomeTitle: {
    fontSize: DesignSystem.typography.fontSizes['4xl'],
    fontFamily: DesignSystem.typography.fontFamilies.medium,
    color: DesignSystem.colors.white,
    textAlign: 'center',
    letterSpacing: DesignSystem.typography.letterSpacing.tight,
  },
  welcomeSubtitle: {
    fontSize: DesignSystem.typography.fontSizes.base,
    fontFamily: DesignSystem.typography.fontFamilies.regular,
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
    ...DesignSystem.components.glassCard,
    padding: DesignSystem.spacing.xl,
    marginBottom: DesignSystem.spacing.lg,
    width: '100%',
  },
  cardTitle: {
    fontSize: 22,
    fontFamily: DesignSystem.typography.fontFamilies.semibold,
    color: DesignSystem.colors.white,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 15,
    color: DesignSystem.colors.whiteOverlay['70'],
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
    fontFamily: DesignSystem.typography.fontFamilies.semibold,
    color: DesignSystem.colors.primary,
  },
  mediumCard: {
    ...DesignSystem.components.glassCard,
    padding: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.lg,
    width: '100%',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: DesignSystem.typography.fontFamilies.semibold,
    color: DesignSystem.colors.white,
  },
  smallCard: {
    ...DesignSystem.components.glassCard,
    padding: DesignSystem.spacing.lg,
  },
  smallCardTitle: {
    fontSize: 19,
    fontFamily: DesignSystem.typography.fontFamilies.semibold,
    color: DesignSystem.colors.white,
    marginBottom: 2,
  },
  smallCardSubtitle: {
    fontSize: 15,
    color: DesignSystem.colors.whiteOverlay['70'],
  },
  // Netflix-style course discovery
  section: {
    marginBottom: DesignSystem.spacing['2xl'],
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: DesignSystem.typography.fontFamilies.semibold,
    color: DesignSystem.colors.white,
    marginBottom: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.xl,
  },
  horizontalScroll: {
    paddingLeft: DesignSystem.spacing.xl,
    paddingRight: DesignSystem.spacing.lg,
  },
  emptyState: {
    paddingVertical: DesignSystem.spacing['2xl'],
    paddingHorizontal: DesignSystem.spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: DesignSystem.colors.whiteOverlay['70'],
    textAlign: 'center',
  },
  verticalList: {
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingBottom: DesignSystem.spacing.xl,
  },
  loadingText: {
    fontSize: 15,
    color: DesignSystem.colors.whiteOverlay['70'],
    paddingVertical: DesignSystem.spacing.lg,
    paddingHorizontal: DesignSystem.spacing.xl,
  },
});

export default homeStyles;
