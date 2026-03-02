import { StyleSheet } from 'react-native';
import { sharedStyles } from './sharedStyles';
import { DesignSystem } from './theme';

export const lessonPlayerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: DesignSystem.spacing.lg,
    paddingBottom: 100, // Space for floating button
  },
  // Back Button
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: DesignSystem.spacing.md,
    alignSelf: 'flex-start',
  },
  backIcon: sharedStyles.backIcon,
  backText: sharedStyles.backText,
  // Header
  header: {
    marginBottom: DesignSystem.spacing.lg,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: DesignSystem.colors.white,
  },
  // Video Container
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: DesignSystem.spacing.lg,
    borderWidth: 1,
    borderColor: DesignSystem.colors.whiteOverlay['10'],
  },
  videoContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  playButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: DesignSystem.colors.whiteOverlay['20'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 22,
    color: DesignSystem.colors.white,
    fontWeight: '300',
    marginLeft: 3,
  },
  videoInfo: {
    alignItems: 'center',
  },
  videoTitle: {
    fontSize: 14,
    color: DesignSystem.colors.white,
    marginBottom: 4,
  },
  videoDuration: {
    fontSize: 12,
    color: DesignSystem.colors.whiteOverlay['60'],
  },
  // Tempo Control
  tempoControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing.lg,
  },
  tempoButton: {
    padding: DesignSystem.spacing.sm,
  },
  tempoIcon: {
    fontSize: 20,
    color: DesignSystem.colors.white,
  },
  tempoText: {
    fontSize: 16,
    fontWeight: '500',
    color: DesignSystem.colors.white,
    minWidth: 70,
    textAlign: 'center',
  },
  // Segmented Control
  segmentedControl: {
    ...DesignSystem.components.glassSurface,
    padding: 4,
    flexDirection: 'row',
    gap: 4,
    marginBottom: DesignSystem.spacing.lg,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: DesignSystem.colors.white,
  },
  segmentButtonInactive: {
    backgroundColor: 'transparent',
  },
  segmentButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  segmentButtonTextActive: {
    color: DesignSystem.colors.primary,
  },
  segmentButtonTextInactive: {
    color: DesignSystem.colors.whiteOverlay['80'],
  },
  // Notation Section
  notationSection: {
    flex: 1,
    ...DesignSystem.components.glassSurface,
    padding: DesignSystem.spacing.xl,
    borderWidth: 1,
    borderColor: DesignSystem.colors.whiteOverlay['10'],
  },
  // Sargam Styles
  sargamContainer: {
    gap: 10,
  },
  measureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  measureBar: {
    fontSize: 14,
    color: DesignSystem.colors.whiteOverlay['40'],
    minWidth: 20,
  },
  beatsContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  beat: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  beatActive: {
    backgroundColor: '#8B5CF6',
  },
  beatInactive: {
    backgroundColor: DesignSystem.colors.whiteOverlay['10'],
  },
  beatText: {
    fontSize: 14,
    fontWeight: '500',
  },
  beatTextActive: {
    color: DesignSystem.colors.white,
  },
  beatTextInactive: {
    color: DesignSystem.colors.whiteOverlay['90'],
  },
  // Staff Styles
  staffContainer: {
    gap: 20,
  },
  staff: {
    height: 130,
    position: 'relative',
  },
  staffLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: DesignSystem.colors.whiteOverlay['30'],
  },
  trebleClef: {
    position: 'absolute',
    left: 8,
    top: '50%',
    transform: [{ translateY: -22 }],
    fontSize: 52,
    color: DesignSystem.colors.white,
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  notesContainer: {
    position: 'absolute',
    left: 64,
    right: 16,
    top: 0,
    bottom: 0,
  },
  note: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  noteHead: {
    width: 18,
    height: 13,
    borderRadius: 7,
    transform: [{ rotate: '-12deg' }],
  },
  noteHeadActive: {
    backgroundColor: '#A78BFA',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  noteHeadInactive: {
    backgroundColor: DesignSystem.colors.whiteOverlay['90'],
  },
  noteStem: {
    position: 'absolute',
    width: 2,
    height: 26,
    left: '85%',
    top: -26,
  },
  noteStemActive: {
    backgroundColor: '#A78BFA',
  },
  noteStemInactive: {
    backgroundColor: DesignSystem.colors.whiteOverlay['90'],
  },
  // Floating Button
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: DesignSystem.spacing.xl,
    backgroundColor: 'transparent',
  },
  floatingButton: {
    width: '100%',
    backgroundColor: DesignSystem.colors.white,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
  },
  floatingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignSystem.colors.primary,
  },
});

export default lessonPlayerStyles;
