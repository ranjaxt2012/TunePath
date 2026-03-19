/**
 * Tutor Upload Screen — Record / Library / YouTube.
 * Step 1: Pick input method.
 * YouTube flow: URL -> Preview -> Confirm ownership -> Details.
 * Direct flow: Pick video -> Details.
 * Step 2: Lesson details (title, instrument, level, shruti).
 * Step 3: Upload + processing with polling.
 */

import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenGradient } from '@/src/components/common/ScreenGradient';
import { useTheme } from '@/src/contexts/ThemeContext';
import {
  FontSize,
  Radius,
  Spacing,
  Typography,
} from '@/src/constants/theme';
import {
  getCourses,
  getInstruments,
  getLessonStatus,
  getLevels,
  getYouTubePreview,
  uploadLessonVideo,
  uploadLessonYouTube,
  type Course,
  type Instrument,
  type LessonStatusResponse,
  type Level,
  type YouTubePreview,
} from '@/src/services/apiClient';

const SHRUTI_OPTIONS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const POLL_INTERVAL_MS = 5000;

type Step = 'pick-method' | 'youtube-url' | 'youtube-preview' | 'details' | 'processing';

export default function TutorUploadScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [step, setStep] = useState<Step>('pick-method');
  const [error, setError] = useState<string | null>(null);

  const styles = StyleSheet.create({
    screen: { flex: 1 },
    safe: { flex: 1 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      gap: Spacing.md,
    },
    backBtn: { padding: Spacing.xs },
    headerTitle: {
      fontSize: FontSize.xl,
      fontFamily: Typography.bold,
      color: theme.textPrimary,
    },
    errorBanner: {
      backgroundColor: 'rgba(239,68,68,0.3)',
      marginHorizontal: Spacing.lg,
      padding: Spacing.md,
      borderRadius: Radius.md,
      marginBottom: Spacing.md,
    },
    errorText: { fontSize: FontSize.sm, color: theme.error },
    scroll: { flex: 1 },
    scrollContent: { padding: Spacing.lg, paddingBottom: 100 },
    pickSection: { gap: Spacing.lg },
    pickTitle: {
      fontSize: FontSize.lg,
      fontFamily: Typography.semiBold,
      color: theme.textPrimary,
      marginBottom: Spacing.md,
      textAlign: 'center',
    },
    optionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      backgroundColor: theme.cardBg,
      padding: Spacing.xl,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: theme.borderColor,
    },
    optionText: { fontSize: FontSize.md, fontFamily: Typography.medium, color: theme.textPrimary },
    youtubeUrlSection: { gap: Spacing.md },
    label: { fontSize: FontSize.sm, fontFamily: Typography.semiBold, color: theme.textSecondary, marginTop: Spacing.md },
    input: {
      height: 48,
      backgroundColor: theme.cardBg,
      borderRadius: Radius.md,
      paddingHorizontal: Spacing.md,
      fontSize: FontSize.md,
      color: theme.textPrimary,
      borderWidth: 1,
      borderColor: theme.borderColor,
    },
    primaryBtn: {
      height: 52,
      backgroundColor: '#FFFFFF',
      borderRadius: Radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: Spacing.lg,
    },
    primaryBtnText: { fontSize: FontSize.md, fontFamily: Typography.semiBold, color: theme.bgPrimary },
    btnDisabled: { opacity: 0.6 },
    previewCard: {
      backgroundColor: theme.cardBg,
      borderRadius: Radius.lg,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: theme.borderColor,
    },
    thumbnail: { width: '100%', height: 180, borderRadius: Radius.md, marginBottom: Spacing.md },
    previewTitle: { fontSize: FontSize.lg, fontFamily: Typography.semiBold, color: theme.textPrimary, marginBottom: Spacing.xs },
    previewChannel: { fontSize: FontSize.sm, color: theme.textSecondary, marginBottom: Spacing.xs },
    previewDuration: { fontSize: FontSize.sm, color: theme.textDisabled, marginBottom: Spacing.md },
    warningBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      backgroundColor: 'rgba(245,158,11,0.2)',
      padding: Spacing.md,
      borderRadius: Radius.md,
      marginBottom: Spacing.md,
    },
    warningText: { fontSize: FontSize.sm, color: theme.error },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.borderColorStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: { backgroundColor: theme.borderColorStrong },
    checkboxLabel: { fontSize: FontSize.md, color: theme.textPrimary, flex: 1 },
    detailsSection: { gap: Spacing.xs },
    pickerRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
    pill: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.full,
      backgroundColor: theme.cardBg,
      borderWidth: 1,
      borderColor: theme.borderColor,
    },
    pillSelected: { backgroundColor: theme.bgPrimary, borderColor: theme.borderColorStrong },
    pillText: { fontSize: FontSize.sm, color: theme.textSecondary },
    pillTextSelected: { color: theme.textPrimary },
    processingSection: { gap: Spacing.lg },
    processingTitle: {
      fontSize: FontSize.lg,
      fontFamily: Typography.semiBold,
      color: theme.textPrimary,
      textAlign: 'center',
    },
    checklist: { gap: Spacing.sm },
    checklistRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    circle: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.textDisabled,
    },
    circleActive: { borderColor: theme.success, backgroundColor: theme.success },
    checklistText: { fontSize: FontSize.md, color: theme.textSecondary },
    checklistTextDone: { color: theme.textPrimary },
    processingHint: { fontSize: FontSize.sm, color: theme.textDisabled, textAlign: 'center' },
    reviewReady: { marginTop: Spacing.xl, gap: Spacing.md },
    reviewReadyText: { fontSize: FontSize.lg, fontFamily: Typography.semiBold, color: theme.success, textAlign: 'center' },
    secondaryBtn: { backgroundColor: theme.cardBg, borderWidth: 1, borderColor: theme.borderColor },
    secondaryBtnText: { fontSize: FontSize.md, fontFamily: Typography.semiBold, color: theme.textPrimary },
    ghostBtn: { backgroundColor: 'transparent' },
    ghostBtnText: { fontSize: FontSize.md, fontFamily: Typography.regular, color: theme.textSecondary },
  });

  // YouTube flow
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubePreview, setYoutubePreview] = useState<YouTubePreview | null>(null);
  const [youtubePreviewLoading, setYoutubePreviewLoading] = useState(false);
  const [confirmedOwnership, setConfirmedOwnership] = useState(false);

  // Direct upload
  const [selectedVideoUri, setSelectedVideoUri] = useState<string | null>(null);
  const [, setSelectedVideoDuration] = useState<number | null>(null);

  // Lesson details
  const [title, setTitle] = useState('');
  const [instrumentId, setInstrumentId] = useState('');
  const [levelId, setLevelId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [shruti, setShruti] = useState('C');

  // API data
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // Processing
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [, setJobId] = useState<string | null>(null);
  const [sourceType, setSourceType] = useState<'direct_upload' | 'youtube'>('direct_upload');
  const [status, setStatus] = useState<LessonStatusResponse | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    getInstruments().then(setInstruments).catch(() => setInstruments([]));
    getLevels().then(setLevels).catch(() => setLevels([]));
  }, []);

  useEffect(() => {
    const instSlug = instruments.find((i) => i.id === instrumentId)?.slug;
    const lvlSlug = levels.find((l) => l.id === levelId)?.slug;
    if (instSlug && lvlSlug) {
      getCourses({ instrument: instSlug, level: lvlSlug }).then(setCourses).catch(() => setCourses([]));
    } else {
      setCourses([]);
    }
  }, [instrumentId, levelId, instruments, levels]);

  const handlePickVideo = useCallback(async (useCamera: boolean) => {
    setError(null);
    const { status } = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Camera/library permission required');
      return;
    }
    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
          videoMaxDuration: 1800,
          quality: 1,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
          videoMaxDuration: 1800,
          quality: 1,
        });
    if (result.canceled) return;
    const asset = result.assets[0];
    setSelectedVideoUri(asset.uri);
    setSelectedVideoDuration(asset.duration ?? null);
    setSourceType('direct_upload');
    setStep('details');
  }, []);

  const handleYoutubeLink = useCallback(() => {
    setStep('youtube-url');
    setYoutubeUrl('');
    setYoutubePreview(null);
    setConfirmedOwnership(false);
  }, []);

  const handlePreviewYoutube = useCallback(async () => {
    setError(null);
    setYoutubePreviewLoading(true);
    try {
      const meta = await getYouTubePreview(youtubeUrl.trim());
      setYoutubePreview(meta);
      setTitle(meta.title);
      setStep('youtube-preview');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That doesn\'t look like a YouTube link');
    } finally {
      setYoutubePreviewLoading(false);
    }
  }, [youtubeUrl]);

  const handleUseYoutubeVideo = useCallback(() => {
    if (!confirmedOwnership) return;
    setSourceType('youtube');
    setStep('details');
  }, [confirmedOwnership]);

  const handleSubmitDetails = useCallback(async () => {
    setError(null);
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!instrumentId || !levelId || !courseId) {
      setError('Select instrument, level, and course');
      return;
    }
    setStep('processing');
    setUploadProgress(0);
    try {
      if (sourceType === 'youtube') {
        if (!youtubeUrl.trim() || !confirmedOwnership) {
          setError('YouTube URL and ownership confirmation required');
          setStep('details');
          return;
        }
        const res = await uploadLessonYouTube({
          youtube_url: youtubeUrl.trim(),
          title: title.trim(),
          instrument_id: instrumentId,
          level_id: levelId,
          course_id: courseId,
          shruti,
          confirmed_own_content: true,
        });
        setLessonId(res.lesson_id);
        setJobId(res.job_id);
        setUploadProgress(100);
      } else {
        if (!selectedVideoUri) {
          setError('No video selected');
          setStep('details');
          return;
        }
        const formData = new FormData();
        formData.append('video', {
          uri: selectedVideoUri,
          type: 'video/mp4',
          name: 'video.mp4',
        } as unknown as Blob);
        formData.append('title', title.trim());
        formData.append('instrument_id', instrumentId);
        formData.append('level_id', levelId);
        formData.append('course_id', courseId);
        formData.append('shruti', shruti);
        const res = await uploadLessonVideo(formData);
        setLessonId(res.lesson_id);
        setJobId(res.job_id);
        setUploadProgress(100);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
      setStep('details');
    }
  }, [
    title,
    instrumentId,
    levelId,
    courseId,
    shruti,
    sourceType,
    youtubeUrl,
    confirmedOwnership,
    selectedVideoUri,
  ]);

  useEffect(() => {
    if (step !== 'processing' || !lessonId) return;
    let cancelled = false;
    const poll = async () => {
      if (cancelled) return;
      try {
        const s = await getLessonStatus(lessonId);
        if (cancelled) return;
        setStatus(s);
        if (s.status === 'review_ready' || s.status === 'failed') clearInterval(id);
      } catch {
        // keep polling
      }
    };
    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [step, lessonId]);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const renderChecklist = () => {
    const s = status?.status ?? 'queued';
    const isYoutube = sourceType === 'youtube';
    const items = isYoutube
      ? [
          { key: 'yt', label: 'YouTube video found', done: true },
          { key: 'download', label: 'Downloading audio...', done: s !== 'queued' },
          { key: 'crepe', label: 'Detecting notes (CREPE)...', done: s === 'processing' || s === 'review_ready' },
          { key: 'whisper', label: 'Syncing words (Whisper)', done: s === 'review_ready' },
          { key: 'notation', label: 'Building notation', done: s === 'review_ready' },
        ]
      : [
          { key: 'upload', label: 'Video uploaded', done: uploadProgress >= 100 },
          { key: 'audio', label: 'Audio extracted', done: s !== 'queued' },
          { key: 'crepe', label: 'Detecting notes (CREPE)...', done: s === 'processing' || s === 'review_ready' },
          { key: 'whisper', label: 'Syncing words (Whisper)', done: s === 'review_ready' },
          { key: 'notation', label: 'Building notation', done: s === 'review_ready' },
        ];
    return (
      <View style={styles.checklist}>
        {items.map((it, i) => (
          <View key={it.key} style={styles.checklistRow}>
            {it.done ? (
              <Ionicons name="checkmark-circle" size={20} color={theme.success} />
            ) : (
              <View style={[styles.circle, i === 1 || (isYoutube && i === 2) ? styles.circleActive : null]} />
            )}
            <Text style={[styles.checklistText, it.done && styles.checklistTextDone]}>{it.label}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScreenGradient style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          {step !== 'pick-method' && (
            <Pressable
              onPress={() => {
                if (step === 'youtube-url' || step === 'youtube-preview') setStep('pick-method');
                else if (step === 'details') {
                  if (sourceType === 'youtube' && youtubePreview) setStep('youtube-preview');
                  else setStep('pick-method');
                }
              }}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
            </Pressable>
          )}
          <Text style={styles.headerTitle}>
            {step === 'pick-method' && 'Add Lesson'}
            {step === 'youtube-url' && 'Paste YouTube Link'}
            {step === 'youtube-preview' && 'Preview'}
            {step === 'details' && 'Lesson Details'}
            {step === 'processing' && 'Processing'}
          </Text>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {step === 'pick-method' && (
            <View style={styles.pickSection}>
              <Text style={styles.pickTitle}>How would you like to add your lesson?</Text>
              <Pressable style={styles.optionBtn} onPress={() => handlePickVideo(true)}>
                <Ionicons name="videocam" size={32} color={theme.textPrimary} />
                <Text style={styles.optionText}>Record Now</Text>
              </Pressable>
              <Pressable style={styles.optionBtn} onPress={() => handlePickVideo(false)}>
                <Ionicons name="folder-open" size={32} color={theme.textPrimary} />
                <Text style={styles.optionText}>Choose from Library</Text>
              </Pressable>
              <Pressable style={styles.optionBtn} onPress={handleYoutubeLink}>
                <Ionicons name="film" size={32} color={theme.textPrimary} />
                <Text style={styles.optionText}>Paste YouTube Link</Text>
              </Pressable>
            </View>
          )}

          {step === 'youtube-url' && (
            <View style={styles.youtubeUrlSection}>
              <Text style={styles.label}>Paste your YouTube video link</Text>
              <TextInput
                style={styles.input}
                value={youtubeUrl}
                onChangeText={setYoutubeUrl}
                placeholder="https://youtube.com/..."
                placeholderTextColor={theme.textDisabled}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable
                style={[styles.primaryBtn, youtubePreviewLoading && styles.btnDisabled]}
                onPress={handlePreviewYoutube}
                disabled={youtubePreviewLoading || !youtubeUrl.trim()}
              >
                {youtubePreviewLoading ? (
                  <ActivityIndicator color={theme.bgPrimary} />
                ) : (
                  <Text style={styles.primaryBtnText}>Preview →</Text>
                )}
              </Pressable>
            </View>
          )}

          {step === 'youtube-preview' && youtubePreview && (
            <View style={styles.previewCard}>
              <Image source={{ uri: youtubePreview.thumbnail_url }} style={styles.thumbnail} />
              <Text style={styles.previewTitle}>{youtubePreview.title}</Text>
              <Text style={styles.previewChannel}>by {youtubePreview.channel}</Text>
              <Text style={styles.previewDuration}>Duration: {formatDuration(youtubePreview.duration_seconds)}</Text>
              <View style={styles.warningBox}>
                <Ionicons name="warning" size={20} color={theme.error} />
                <Text style={styles.warningText}>Only use videos you own or have rights to</Text>
              </View>
              <Pressable
                style={styles.checkboxRow}
                onPress={() => setConfirmedOwnership((v) => !v)}
              >
                <View style={[styles.checkbox, confirmedOwnership && styles.checkboxChecked]}>
                  {confirmedOwnership && <Ionicons name="checkmark" size={14} color={theme.textPrimary} />}
                </View>
                <Text style={styles.checkboxLabel}>I confirm this is my own content</Text>
              </Pressable>
              <Pressable
                style={[styles.primaryBtn, !confirmedOwnership && styles.btnDisabled]}
                onPress={handleUseYoutubeVideo}
                disabled={!confirmedOwnership}
              >
                <Text style={styles.primaryBtnText}>Use This Video →</Text>
              </Pressable>
            </View>
          )}

          {step === 'details' && (
            <View style={styles.detailsSection}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Lesson title"
                placeholderTextColor={theme.textDisabled}
              />
              <Text style={styles.label}>Instrument</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow}>
                {instruments.map((i) => (
                  <Pressable
                    key={i.id}
                    style={[styles.pill, instrumentId === i.id && styles.pillSelected]}
                    onPress={() => setInstrumentId(i.id)}
                  >
                    <Text style={[styles.pillText, instrumentId === i.id && styles.pillTextSelected]}>{i.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              <Text style={styles.label}>Level</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow}>
                {levels.map((l) => (
                  <Pressable
                    key={l.id}
                    style={[styles.pill, levelId === l.id && styles.pillSelected]}
                    onPress={() => setLevelId(l.id)}
                  >
                    <Text style={[styles.pillText, levelId === l.id && styles.pillTextSelected]}>{l.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              <Text style={styles.label}>Course</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow}>
                {courses.map((c) => (
                  <Pressable
                    key={c.id}
                    style={[styles.pill, courseId === c.id && styles.pillSelected]}
                    onPress={() => setCourseId(c.id)}
                  >
                    <Text style={[styles.pillText, courseId === c.id && styles.pillTextSelected]} numberOfLines={1}>
                      {c.title}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              <Text style={styles.label}>Starting Note (Shruti)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow}>
                {SHRUTI_OPTIONS.map((s) => (
                  <Pressable
                    key={s}
                    style={[styles.pill, shruti === s && styles.pillSelected]}
                    onPress={() => setShruti(s)}
                  >
                    <Text style={[styles.pillText, shruti === s && styles.pillTextSelected]}>{s}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              <Pressable style={styles.primaryBtn} onPress={handleSubmitDetails}>
                <Text style={styles.primaryBtnText}>Upload & Process</Text>
              </Pressable>
            </View>
          )}

          {step === 'processing' && (
            <View style={styles.processingSection}>
              <Text style={styles.processingTitle}>Processing your lesson...</Text>
              {renderChecklist()}
              <Text style={styles.processingHint}>Usually takes 1–3 minutes</Text>
              {status?.status === 'review_ready' && (
                <View style={styles.reviewReady}>
                  <Text style={styles.reviewReadyText}>✅ Ready to review!</Text>
                  <Pressable
                    style={styles.primaryBtn}
                    onPress={() => {
                      const tutorUrl = process.env.EXPO_PUBLIC_TUTOR_WEB_URL ?? 'https://tutor.tunepath.app';
                      Linking.openURL(tutorUrl);
                    }}
                  >
                    <Text style={styles.primaryBtnText}>Review on Web →</Text>
                  </Pressable>
                  {lessonId && (
                    <Pressable
                      style={[styles.primaryBtn, styles.secondaryBtn]}
                      onPress={() => router.replace(`/lesson/${lessonId}`)}
                    >
                      <Text style={styles.secondaryBtnText}>Preview in App</Text>
                    </Pressable>
                  )}
                  <Pressable
                    style={styles.ghostBtn}
                    onPress={() => router.replace('/')}
                  >
                    <Text style={styles.ghostBtnText}>Done</Text>
                  </Pressable>
                </View>
              )}
              {status?.status === 'failed' && (
                <View style={styles.reviewReady}>
                  <Text style={styles.errorText}>{status.error_message ?? 'Processing failed'}</Text>
                  <Pressable style={styles.primaryBtn} onPress={() => setStep('details')}>
                    <Text style={styles.primaryBtnText}>Try Again</Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ScreenGradient>
  );
}
