import { Dimensions, StyleSheet } from 'react-native';
import { DesignSystem } from './theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = DesignSystem.spacing.xl; // 20 — matches auth
const NOTE_SIZE = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - 32 - DesignSystem.spacing.sm * 3) / 4;

export const lessonPlayerStyles = StyleSheet.create({
  // Match auth layout: safeAreaContainer → container → content
  safeAreaContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: DesignSystem.spacing['3xl'],
    paddingBottom: 0,
    width: '100%',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    width: '100%',
  },

  // Header — matches auth back button pattern
  header: {
    marginBottom: DesignSystem.spacing['2xl'],
  },
  backBtn: {
    marginBottom: DesignSystem.spacing.xs,
    alignSelf: 'flex-start',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: DesignSystem.spacing.md,
    alignSelf: 'flex-start',
  },
  backIcon: {
    fontSize: 24,
    color: DesignSystem.colors.white,
    fontWeight: '300',
  },
  backText: {
    fontSize: DesignSystem.typography.fontSizes.lg,
    fontWeight: DesignSystem.typography.fontWeights.semibold,
    color: DesignSystem.colors.white,
  },
  headerMeta: {
    fontSize: DesignSystem.typography.fontSizes.sm,
    color: DesignSystem.colors.whiteOverlay['70'],
    marginBottom: DesignSystem.spacing.xs,
  },
  lessonTitle: {
    fontSize: DesignSystem.typography.fontSizes['3xl'],
    fontWeight: DesignSystem.typography.fontWeights.bold,
    color: DesignSystem.colors.white,
  },

  // Video card — glass card, full width, 16:9
  videoCard: {
    width: '100%',
    aspectRatio: 16 / 9,
    ...DesignSystem.components.glassCard,
    overflow: 'hidden',
    marginBottom: DesignSystem.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  videoPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: DesignSystem.colors.whiteOverlay['10'],
  },
  playOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: DesignSystem.colors.whiteOverlay['30'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 28,
    color: DesignSystem.colors.white,
    marginLeft: 4,
  },
  videoInfo: {
    position: 'absolute',
    bottom: DesignSystem.spacing.lg,
    left: DesignSystem.spacing.lg,
    right: DesignSystem.spacing.lg,
    alignItems: 'center',
  },
  videoTitle: {
    fontSize: DesignSystem.typography.fontSizes.base,
    fontWeight: DesignSystem.typography.fontWeights.semibold,
    color: DesignSystem.colors.white,
    textAlign: 'center',
  },
  videoDuration: {
    fontSize: DesignSystem.typography.fontSizes.sm,
    color: DesignSystem.colors.whiteOverlay['70'],
    marginTop: 2,
  },

  // BPM — pill style like auth inputs
  bpmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing.xl,
    gap: DesignSystem.spacing.lg,
  },
  bpmBtn: {
    width: 44,
    height: 44,
    backgroundColor: DesignSystem.colors.whiteOverlay['10'],
    borderWidth: 1,
    borderColor: DesignSystem.colors.whiteOverlay['20'],
    borderRadius: DesignSystem.borderRadius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  bpmBtnText: {
    fontSize: 24,
    color: DesignSystem.colors.white,
    lineHeight: 28,
  },
  bpmDisplay: {
    paddingHorizontal: DesignSystem.spacing['2xl'],
    paddingVertical: DesignSystem.spacing.sm,
    backgroundColor: DesignSystem.colors.whiteOverlay['10'],
    borderWidth: 1,
    borderColor: DesignSystem.colors.whiteOverlay['20'],
    borderRadius: DesignSystem.borderRadius.full,
    minWidth: 120,
    alignItems: 'center',
  },
  bpmText: {
    fontSize: DesignSystem.typography.fontSizes.lg,
    fontWeight: DesignSystem.typography.fontWeights.semibold,
    color: DesignSystem.colors.white,
  },

  // Sargam | Staff toggle — segmented control
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: DesignSystem.colors.whiteOverlay['10'],
    borderWidth: 1,
    borderColor: DesignSystem.colors.whiteOverlay['20'],
    borderRadius: DesignSystem.borderRadius.full,
    padding: 4,
    marginBottom: DesignSystem.spacing.xl,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: DesignSystem.spacing.sm,
    borderRadius: DesignSystem.borderRadius.full,
    alignItems: 'center',
  },
  toggleOptionActive: {
    backgroundColor: DesignSystem.colors.white,
  },
  toggleOptionText: {
    fontSize: DesignSystem.typography.fontSizes.base,
    fontWeight: DesignSystem.typography.fontWeights.semibold,
    color: DesignSystem.colors.whiteOverlay['70'],
  },
  toggleOptionTextActive: {
    color: DesignSystem.colors.primary,
  },

  // Sargam grid — glass scrollable container
  sargamGrid: {
    width: '100%',
    backgroundColor: DesignSystem.colors.whiteOverlay['10'],
    borderWidth: 1,
    borderColor: DesignSystem.colors.whiteOverlay['20'],
    borderRadius: DesignSystem.borderRadius['2xl'],
    padding: DesignSystem.spacing.lg,
    gap: DesignSystem.spacing.sm,
  },
  sargamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  beatMarker: {
    color: DesignSystem.colors.whiteOverlay['50'],
    fontSize: 18,
    width: 12,
    textAlign: 'center',
  },
  noteCircle: {
    width: NOTE_SIZE,
    height: NOTE_SIZE,
    borderRadius: NOTE_SIZE / 2,
    backgroundColor: DesignSystem.colors.whiteOverlay['15'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteCircleActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.9)',
  },
  noteText: {
    fontSize: NOTE_SIZE > 52 ? 14 : 12,
    fontWeight: DesignSystem.typography.fontWeights.semibold,
    color: DesignSystem.colors.whiteOverlay['70'],
  },
  noteTextActive: {
    color: DesignSystem.colors.white,
    fontWeight: DesignSystem.typography.fontWeights.bold,
  },

  staffPlaceholder: {
    height: 200,
    backgroundColor: DesignSystem.colors.whiteOverlay['10'],
    borderWidth: 1,
    borderColor: DesignSystem.colors.whiteOverlay['20'],
    borderRadius: DesignSystem.borderRadius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bottom button — matches auth button style
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: DesignSystem.spacing.xl,
    paddingBottom: DesignSystem.spacing['4xl'],
    backgroundColor: DesignSystem.colors.primary,
  },
  guidedPracticeBtn: {
    width: '100%',
    height: 52,
    backgroundColor: DesignSystem.colors.white,
    borderRadius: DesignSystem.borderRadius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  guidedPracticeBtnText: {
    fontSize: DesignSystem.typography.fontSizes.lg,
    fontWeight: DesignSystem.typography.fontWeights.semibold,
    color: DesignSystem.colors.primary,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mutedText: {
    fontSize: DesignSystem.typography.fontSizes.base,
    color: DesignSystem.colors.whiteOverlay['70'],
  },
  errorText: {
    fontSize: DesignSystem.typography.fontSizes.base,
    color: '#EF4444',
    textAlign: 'center',
    paddingHorizontal: DesignSystem.spacing.xl,
  },
});

export { NOTE_SIZE };
export default lessonPlayerStyles;
