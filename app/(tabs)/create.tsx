import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { WEB_CONTENT_MAX } from '@/src/utils/platform';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme, Spacing, Radius, FontSize } from '@/src/design';
import { useAuthStore } from '@/src/store/authStore';
import {
  getYouTubePreview,
  uploadLessonYouTube,
  getLessonStatus,
  type YouTubePreview,
} from '@/src/services/apiClient';

const TAGS_OPTIONS = ['Classical', 'Folk', 'Bollywood', 'Beginner', 'Intermediate', 'Devotional', 'Jazz'];

type ProcessStep = { label: string; done: boolean; active: boolean };

function UploadOptionCard({
  icon,
  title,
  subtitle,
  onPress,
  theme,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  theme: any;
}) {
  return (
    <TouchableOpacity
      style={[styles.optionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.optionIcon, { backgroundColor: theme.surfaceHigh }]}>
        <Text style={styles.optionEmoji}>{icon}</Text>
      </View>
      <View style={styles.optionText}>
        <Text style={[styles.optionTitle, { color: theme.textPrimary }]}>{title}</Text>
        <Text style={[styles.optionSub, { color: theme.textSecondary }]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.textDisabled} />
    </TouchableOpacity>
  );
}

export default function CreateScreen() {
  const { theme } = useTheme();
  const trustTier = useAuthStore((s) => s.trustTier);
  const instrument = useAuthStore((s) => s.selectedInstrumentSlug);
  const level = useAuthStore((s) => s.selectedLevelSlug);

  const [showYouTube, setShowYouTube] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);

  // YouTube sheet state
  const [ytUrl, setYtUrl] = useState('');
  const [ytPreview, setYtPreview] = useState<YouTubePreview | null>(null);
  const [ytPreviewLoading, setYtPreviewLoading] = useState(false);
  const [ytConfirmed, setYtConfirmed] = useState(false);
  const [ytSubmitting, setYtSubmitting] = useState(false);

  // Details sheet state
  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [pickedVideoUri, setPickedVideoUri] = useState<string | null>(null);

  // Processing state
  const [processedLessonId, setProcessedLessonId] = useState<string | null>(null);
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const buildSteps = (status: string): ProcessStep[] => {
    if (trustTier === 'new') {
      return [
        { label: '✅ Video uploaded', done: true, active: false },
        { label: '⏳ AI generating notation...', done: status !== 'pending_review', active: status === 'processing' },
        { label: '○  Pending review', done: status === 'approved', active: status === 'pending_review' },
        { label: '○  Goes live after approval', done: status === 'approved', active: false },
      ];
    }
    if (trustTier === 'trusted') {
      return [
        { label: '✅ Video uploaded', done: true, active: false },
        { label: '⏳ Converting to MP4...', done: status !== 'pending_review', active: status === 'processing' },
        { label: '○  AI detecting notes...', done: status === 'approved', active: status === 'ai_processing' },
        { label: '○  Goes live automatically!', done: status === 'approved', active: false },
      ];
    }
    return [
      { label: '✅ Video uploaded', done: true, active: false },
      { label: '✅ Converting...', done: true, active: false },
      { label: '✅ AI notation generated', done: true, active: false },
      { label: '✅ Live!', done: true, active: false },
    ];
  };

  useEffect(() => {
    if (!showProcessing || !processedLessonId) return;
    const poll = setInterval(async () => {
      try {
        const res = await getLessonStatus(processedLessonId);
        setSteps(buildSteps(res.status));
        if (res.status === 'approved' || res.status === 'rejected') {
          clearInterval(poll);
        }
      } catch { /* ignore */ }
    }, 5000);
    pollRef.current = poll;
    return () => clearInterval(poll);
  }, [showProcessing, processedLessonId, trustTier]);

  const handleYtUrlChange = async (url: string) => {
    setYtUrl(url);
    setYtPreview(null);
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) return;
    setYtPreviewLoading(true);
    try {
      const preview = await getYouTubePreview(url);
      setYtPreview(preview);
    } catch { /* ignore */ }
    finally { setYtPreviewLoading(false); }
  };

  const handleYtSubmit = async () => {
    if (!ytConfirmed || !ytPreview) return;
    setYtSubmitting(true);
    try {
      const res = await uploadLessonYouTube({
        youtube_url: ytUrl,
        title: ytPreview.title,
        instrument_id: instrument ?? 'harmonium',
        level_id: level ?? 'beginner',
        course_id: '',
        confirmed_own_content: true,
      });
      setProcessedLessonId(res.lesson_id);
      setSteps(buildSteps('pending_review'));
      setShowYouTube(false);
      setShowProcessing(true);
    } catch (e: any) {
      Alert.alert('Upload failed', e.message ?? 'Please try again');
    } finally {
      setYtSubmitting(false);
    }
  };

  const handlePickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      setPickedVideoUri(result.assets[0].uri);
      setShowDetails(true);
    }
  };

  const handleRecordVideo = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    });
    if (!result.canceled && result.assets[0]) {
      setPickedVideoUri(result.assets[0].uri);
      setShowDetails(true);
    }
  };

  const titleText = trustTier === 'new' ? '📤 Uploaded!' :
    trustTier === 'trusted' ? '🎉 Processing!' : '🚀 Live!';
  const subText = trustTier === 'new' ? 'Under review — usually 24 hours' :
    trustTier === 'trusted' ? 'Goes live automatically' : 'Notation generating...';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }, Platform.OS === 'web' && { maxWidth: WEB_CONTENT_MAX }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerArea}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Share music 🎵</Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>Anyone can upload a lesson</Text>
        </View>

        {/* Upload options */}
        <View style={styles.optionsSection}>
          <UploadOptionCard icon="📹" title="Record video" subtitle="Film yourself playing" onPress={handleRecordVideo} theme={theme} />
          <UploadOptionCard icon="📁" title="Upload from library" subtitle="Pick a video from your phone" onPress={handlePickVideo} theme={theme} />
          <UploadOptionCard icon="▶" title="Import from YouTube" subtitle="Paste a YouTube link" onPress={() => setShowYouTube(true)} theme={theme} />
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {/* Verified creator card */}
        <TouchableOpacity style={[styles.verifiedCard, { backgroundColor: theme.surfaceHigh, borderColor: theme.primary }]}>
          <View style={[styles.verifiedBadge, { backgroundColor: theme.primary }]}>
            <Text style={[styles.verifiedBadgeText, { color: theme.textOnPrimary }]}>✓</Text>
          </View>
          <View style={styles.verifiedInfo}>
            <Text style={[styles.verifiedTitle, { color: theme.textPrimary }]}>Get Verified</Text>
            <Text style={[styles.verifiedSub, { color: theme.textSecondary }]}>Priority placement + trusted badge</Text>
          </View>
          <Text style={[styles.applyBtn, { color: theme.primary }]}>Apply →</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* YouTube Import Sheet */}
      <Modal visible={showYouTube} transparent animationType="slide" onRequestClose={() => setShowYouTube(false)}>
        <View style={styles.modalWrapper}>
          <TouchableOpacity style={styles.modalBg} onPress={() => setShowYouTube(false)} activeOpacity={1} />
          <View style={[styles.sheet, { backgroundColor: theme.modalBg }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Import from YouTube</Text>
              <TouchableOpacity onPress={() => setShowYouTube(false)}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.sheetContent}>
              <TextInput
                style={[styles.urlInput, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="Paste YouTube URL here"
                placeholderTextColor={theme.textDisabled}
                value={ytUrl}
                onChangeText={handleYtUrlChange}
                autoCapitalize="none"
                keyboardType="url"
              />
              {ytPreviewLoading && <ActivityIndicator color={theme.primary} style={{ marginVertical: Spacing.md }} />}
              {ytPreview && (
                <View style={[styles.previewCard, { backgroundColor: theme.surface }]}>
                  {ytPreview.thumbnail_url ? (
                    <Image source={{ uri: ytPreview.thumbnail_url }} style={styles.previewThumb} resizeMode="cover" />
                  ) : null}
                  <View style={styles.previewInfo}>
                    <Text style={[styles.previewTitle, { color: theme.textPrimary }]} numberOfLines={2}>{ytPreview.title}</Text>
                    <Text style={[styles.previewChannel, { color: theme.textSecondary }]}>{ytPreview.channel}</Text>
                  </View>
                </View>
              )}
              <TouchableOpacity
                style={styles.checkRow}
                onPress={() => setYtConfirmed(!ytConfirmed)}
              >
                <Ionicons
                  name={ytConfirmed ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={ytConfirmed ? theme.primary : theme.textDisabled}
                />
                <Text style={[styles.checkText, { color: theme.textSecondary }]}>
                  I confirm this is my own content
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  { backgroundColor: ytConfirmed && ytPreview ? theme.primary : theme.surface },
                ]}
                onPress={handleYtSubmit}
                disabled={!ytConfirmed || !ytPreview || ytSubmitting}
              >
                {ytSubmitting ? (
                  <ActivityIndicator color={theme.textOnPrimary} />
                ) : (
                  <Text style={[styles.submitBtnText, { color: ytConfirmed && ytPreview ? theme.textOnPrimary : theme.textDisabled }]}>
                    Import this lesson →
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Processing Screen */}
      <Modal visible={showProcessing} transparent animationType="slide" onRequestClose={() => {}}>
        <View style={[styles.processingBg, { backgroundColor: theme.background }]}>
          <Text style={styles.processingEmoji}>{trustTier === 'verified' ? '🚀' : trustTier === 'trusted' ? '🎉' : '📤'}</Text>
          <Text style={[styles.processingTitle, { color: theme.textPrimary }]}>{titleText}</Text>
          <Text style={[styles.processingSub, { color: theme.textSecondary }]}>{subText}</Text>
          <View style={styles.stepsContainer}>
            {steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <Text style={[styles.stepText, { color: step.done ? theme.success : step.active ? theme.primary : theme.textDisabled }]}>
                  {step.label}
                </Text>
                {step.active && <ActivityIndicator size="small" color={theme.primary} style={{ marginLeft: Spacing.sm }} />}
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: theme.primary }]}
            onPress={() => {
              setShowProcessing(false);
              setProcessedLessonId(null);
              setYtUrl('');
              setYtPreview(null);
              setYtConfirmed(false);
            }}
          >
            <Text style={[styles.doneBtnText, { color: theme.textOnPrimary }]}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: Spacing.xxxl },
  headerArea: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.xs,
  },
  headerTitle: { fontSize: 28, fontWeight: '700' },
  headerSub: { fontSize: FontSize.md },
  optionsSection: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionEmoji: { fontSize: 20 },
  optionText: { flex: 1 },
  optionTitle: { fontSize: FontSize.md, fontWeight: '700' },
  optionSub: { fontSize: FontSize.sm, marginTop: 2 },
  divider: { height: 1, marginHorizontal: Spacing.lg, marginVertical: Spacing.xl },
  verifiedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    gap: Spacing.md,
  },
  verifiedBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadgeText: { fontSize: 18, fontWeight: '700' },
  verifiedInfo: { flex: 1 },
  verifiedTitle: { fontSize: FontSize.md, fontWeight: '700' },
  verifiedSub: { fontSize: FontSize.sm, marginTop: 2 },
  applyBtn: { fontSize: FontSize.md, fontWeight: '700' },
  modalWrapper: { flex: 1, justifyContent: 'flex-end' },
  modalBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: '80%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  sheetTitle: { fontSize: FontSize.lg, fontWeight: '700' },
  sheetContent: { padding: Spacing.lg, gap: Spacing.md },
  urlInput: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    fontSize: FontSize.md,
    minHeight: 56,
  },
  previewCard: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  previewThumb: { width: '100%', height: 160 },
  previewInfo: { padding: Spacing.md, gap: 4 },
  previewTitle: { fontSize: FontSize.sm, fontWeight: '600' },
  previewChannel: { fontSize: FontSize.xs },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  checkText: { fontSize: FontSize.sm, flex: 1 },
  submitBtn: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  submitBtnText: { fontSize: FontSize.md, fontWeight: '700' },
  processingBg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  processingEmoji: { fontSize: 64 },
  processingTitle: { fontSize: FontSize.xxl, fontWeight: '700' },
  processingSub: { fontSize: FontSize.md, textAlign: 'center' },
  stepsContainer: { alignSelf: 'stretch', gap: Spacing.md },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepText: { fontSize: FontSize.md },
  doneBtn: {
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
    marginTop: Spacing.lg,
  },
  doneBtnText: { fontSize: FontSize.md, fontWeight: '700' },
});
