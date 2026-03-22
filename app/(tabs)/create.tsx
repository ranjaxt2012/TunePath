import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Spacing, FontSize, Radius } from '@/src/design';
import { useAuthStore } from '@/src/store/authStore';
import { api, setAuthToken } from '@/src/services/api';
import { useAuth } from '@clerk/clerk-expo';

const WEB_CONTENT_MAX = 960;

export default function CreateScreen() {
  const { theme } = useTheme();
  const { trustTier, dbUserId } = useAuthStore();
  const { getToken } = useAuth();

  const [ytModalVisible, setYtModalVisible] = useState(false);
  const [ytUrl, setYtUrl] = useState('');
  const [ytConfirmed, setYtConfirmed] = useState(false);
  const [ytLoading, setYtLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingLessonId, setProcessingLessonId] = useState<string | null>(null);
  const [ytPreview, setYtPreview] = useState<{
    title: string;
    duration_seconds: number;
    thumbnail_url: string;
    channel: string;
    video_id: string;
  } | null>(null);
  const [ytError, setYtError] = useState<string | null>(null);
  const [defaultCourse, setDefaultCourse] = useState<{
    course_id: string;
    instrument_id: string;
    level_id: string;
  } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch default course for YouTube upload when modal opens
  useEffect(() => {
    if (!ytModalVisible) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        setAuthToken(token);
        const [courses, instruments, levels] = await Promise.all([
          api.get<
            {
              id: string;
              instrument_slug: string;
              level_slug: string;
              tutor_id: string;
            }[]
          >('/api/courses?limit=50'),
          api.get<{ id: string; slug: string }[]>('/api/instruments'),
          api.get<{ id: string; slug: string }[]>('/api/levels'),
        ]);
        if (cancelled) return;
        const instMap = Object.fromEntries(instruments.map((i) => [i.slug, i.id]));
        const lvlMap = Object.fromEntries(levels.map((l) => [l.slug, l.id]));
        const myCourse = courses.find((c) => c.tutor_id === dbUserId);
        const first = myCourse ?? courses[0];
        if (first && instMap[first.instrument_slug] && lvlMap[first.level_slug]) {
          setDefaultCourse({
            course_id: first.id,
            instrument_id: instMap[first.instrument_slug],
            level_id: lvlMap[first.level_slug],
          });
        } else {
          setDefaultCourse(null);
        }
      } catch {
        if (!cancelled) setDefaultCourse(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ytModalVisible, getToken, dbUserId]);

  // Poll lesson status every 5s while processing
  useEffect(() => {
    if (!processingLessonId) return;
    pollRef.current = setInterval(async () => {
      try {
        const data = await api.get<{ status: string }>(
          `/api/tutor/lessons/${processingLessonId}/status`
        );
        if (data.status === 'ready' || data.status === 'failed') {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          setProcessing(false);
          setProcessingLessonId(null);
          setYtModalVisible(false);
          if (data.status === 'ready') {
            Alert.alert('Done!', 'Your lesson is ready.');
          } else {
            Alert.alert('Processing failed', 'Something went wrong processing your video.');
          }
        }
      } catch { /* ignore */ }
    }, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [processingLessonId]);

  const containerStyle = [
    styles.container,
    Platform.OS === 'web' && styles.webContainer,
  ];

  const isValidYtUrl = (s: string) =>
    s.includes('youtube.com') || s.includes('youtu.be');

  const openYouTubeModal = () => {
    setYtUrl('');
    setYtConfirmed(false);
    setYtPreview(null);
    setYtError(null);
    setProcessing(false);
    setYtLoading(false);
    setYtModalVisible(true);
  };

  const handlePreview = async () => {
    const url = ytUrl.trim();
    if (!url || !isValidYtUrl(url)) return;
    setYtLoading(true);
    setYtError(null);
    setYtPreview(null);
    try {
      const token = await getToken();
      setAuthToken(token);
      const data = await api.get<{
        title: string;
        duration_seconds: number;
        thumbnail_url: string;
        channel: string;
        video_id: string;
      }>(`/api/tutor/youtube/preview?url=${encodeURIComponent(url)}`);
      setYtPreview(data);
    } catch (e: any) {
      setYtError('Could not load video preview');
      setYtPreview(null);
    } finally {
      setYtLoading(false);
    }
  };

  const handleImport = async () => {
    if (!ytUrl.trim() || !ytConfirmed) return;
    setProcessing(true);
    setYtError(null);
    try {
      const token = await getToken();
      setAuthToken(token);
      if (!defaultCourse) {
        Alert.alert(
          'No course',
          'Please create or join a course first before importing.'
        );
        setProcessing(false);
        return;
      }
      const result = await api.post<{ lesson_id: string }>(
        '/api/tutor/lessons/upload-youtube',
        {
          youtube_url: ytUrl.trim(),
          confirmed_own_content: ytConfirmed,
          course_id: defaultCourse.course_id,
          instrument_id: defaultCourse.instrument_id,
          level_id: defaultCourse.level_id,
        }
      );
      setProcessingLessonId(result.lesson_id);
    } catch (e: any) {
      Alert.alert(
        'Import failed',
        (e as Error).message ?? 'Something went wrong'
      );
      setProcessing(false);
    }
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={containerStyle}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={[styles.title, { color: theme.textPrimary }]}>Share music 🎵</Text>

        {/* Verified creator badge */}
        {trustTier === 'verified' && (
          <View style={[styles.verifiedCard, { backgroundColor: theme.surface, borderColor: theme.success, borderRadius: Radius.lg }]}>
            <Text style={[styles.verifiedBadge, { color: theme.success }]}>✓ Verified Creator</Text>
            <Text style={[styles.verifiedSub, { color: theme.textSecondary }]}>
              Your uploads are published instantly
            </Text>
          </View>
        )}

        {/* Upload options */}
        <View style={styles.optionsStack}>
          <TouchableOpacity
            style={[styles.optionCard, { backgroundColor: theme.surface, borderRadius: Radius.xl, borderColor: theme.border }]}
            onPress={() => Alert.alert('Coming soon', 'Camera recording is not available yet')}
          >
            <View style={styles.optionLeft}>
              <Text style={styles.optionEmoji}>📹</Text>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: theme.textPrimary }]}>Record a video</Text>
                <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>Use your camera</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textDisabled} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, { backgroundColor: theme.surface, borderRadius: Radius.xl, borderColor: theme.border }]}
            onPress={() => Alert.alert('Coming soon', 'Library upload is not available yet')}
          >
            <View style={styles.optionLeft}>
              <Text style={styles.optionEmoji}>📁</Text>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: theme.textPrimary }]}>Upload from library</Text>
                <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>Share your recordings</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textDisabled} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, { backgroundColor: theme.surface, borderRadius: Radius.xl, borderColor: theme.border }]}
            onPress={openYouTubeModal}
          >
            <View style={styles.optionLeft}>
              <Text style={styles.optionEmoji}>▶</Text>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: theme.textPrimary }]}>Import from YouTube</Text>
                <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>Link your existing video</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textDisabled} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* YouTube Import Modal */}
      <Modal
        visible={ytModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setYtModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalSheet, { backgroundColor: theme.modalBg, borderRadius: Radius.xl }]}>
            <View style={styles.modalHandle}>
              <View style={[styles.handleBar, { backgroundColor: theme.border }]} />
            </View>

            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Import from YouTube</Text>

            {processing ? (
              <View style={styles.processingState}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.processingText, { color: theme.textSecondary }]}>
                  Processing your lesson...
                </Text>
                <Text style={[styles.processingSubtext, { color: theme.textDisabled }]}>
                  This may take a few minutes
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.urlInputRow}>
                  <TextInput
                    style={[
                      styles.urlInput,
                      {
                        backgroundColor: theme.surface,
                        color: theme.textPrimary,
                        borderColor: theme.border,
                        borderRadius: Radius.md,
                      },
                    ]}
                    placeholder="Paste YouTube URL here..."
                    placeholderTextColor={theme.textDisabled}
                    value={ytUrl}
                    onChangeText={(text) => {
                      setYtUrl(text);
                      setYtPreview(null);
                      setYtError(null);
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                  />
                  {ytUrl.length > 0 && (
                    <TouchableOpacity
                      style={styles.clearBtn}
                      onPress={() => {
                        setYtUrl('');
                        setYtPreview(null);
                        setYtError(null);
                      }}
                    >
                      <Text style={[styles.clearBtnText, { color: theme.textSecondary }]}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.previewButton,
                    {
                      backgroundColor: isValidYtUrl(ytUrl)
                        ? theme.primary
                        : theme.surface,
                      borderColor: theme.border,
                      borderRadius: Radius.md,
                    },
                  ]}
                  onPress={handlePreview}
                  disabled={!isValidYtUrl(ytUrl) || ytLoading}
                >
                  {ytLoading ? (
                    <ActivityIndicator size="small" color={theme.textOnPrimary} />
                  ) : (
                    <Text
                      style={{
                        color: isValidYtUrl(ytUrl)
                          ? theme.textOnPrimary
                          : theme.textDisabled,
                        fontWeight: '600',
                      }}
                    >
                      Preview
                    </Text>
                  )}
                </TouchableOpacity>

                {ytError && !ytLoading && (
                  <View style={styles.errorBox}>
                    <Text style={[styles.errorTitle, { color: theme.error }]}>
                      {ytError}
                    </Text>
                    <Text style={[styles.errorSub, { color: theme.textSecondary }]}>
                      Make sure it's a valid YouTube URL
                    </Text>
                  </View>
                )}

                {ytPreview && !ytLoading && (
                  <View
                    style={[
                      styles.previewCard,
                      {
                        backgroundColor: theme.surface,
                        borderRadius: Radius.lg,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <View style={styles.thumbnailWrap}>
                      <Image
                        source={{ uri: ytPreview.thumbnail_url }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                      />
                    </View>
                    <Text
                      style={[styles.previewTitle, { color: theme.textPrimary }]}
                      numberOfLines={2}
                    >
                      {ytPreview.title}
                    </Text>
                    <Text
                      style={[styles.previewDuration, { color: theme.textSecondary }]}
                    >
                      {formatDuration(ytPreview.duration_seconds)}
                    </Text>
                    <Text
                      style={[styles.previewChannel, { color: theme.textDisabled }]}
                      numberOfLines={1}
                    >
                      {ytPreview.channel}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setYtConfirmed((v) => !v)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: ytConfirmed ? theme.primary : theme.border,
                        backgroundColor: ytConfirmed ? theme.primary : 'transparent',
                        borderRadius: Radius.sm,
                      },
                    ]}
                  >
                    {ytConfirmed && (
                      <Text style={[styles.checkMark, { color: theme.textOnPrimary }]}>✓</Text>
                    )}
                  </View>
                  <Text style={[styles.checkboxLabel, { color: theme.textSecondary }]}>
                    I confirm I own this content
                  </Text>
                </TouchableOpacity>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.cancelButton, { borderColor: theme.border, borderRadius: Radius.md }]}
                    onPress={() => setYtModalVisible(false)}
                  >
                    <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.importButton,
                      {
                        backgroundColor: ytConfirmed && ytUrl.trim() ? theme.primary : theme.surface,
                        borderRadius: Radius.md,
                      },
                    ]}
                    onPress={handleImport}
                    disabled={
                      !ytConfirmed ||
                      !ytUrl.trim() ||
                      !ytPreview ||
                      !defaultCourse
                    }
                  >
                    <Text
                      style={[
                        styles.importText,
                        {
                          color:
                            ytConfirmed &&
                            ytUrl.trim() &&
                            ytPreview &&
                            defaultCourse
                              ? theme.textOnPrimary
                              : theme.textDisabled,
                        },
                      ]}
                    >
                      Import
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  webContainer: {
    maxWidth: WEB_CONTENT_MAX,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: 'bold',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  verifiedCard: {
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  verifiedBadge: {
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  verifiedSub: {
    fontSize: FontSize.sm,
  },
  optionsStack: {
    gap: Spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderWidth: 1,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  optionEmoji: {
    fontSize: FontSize.xxl,
    width: 36,
    textAlign: 'center',
  },
  optionText: {
    flex: 1,
    gap: Spacing.xs,
  },
  optionTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  optionDesc: {
    fontSize: FontSize.sm,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    minHeight: 400,
  },
  modalHandle: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: 'bold',
    marginBottom: Spacing.lg,
  },
  urlInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  urlInput: {
    flex: 1,
    padding: Spacing.md,
    fontSize: FontSize.md,
    borderWidth: 1,
  },
  clearBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    fontSize: 24,
    fontWeight: '400',
  },
  previewButton: {
    padding: Spacing.md,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  errorBox: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  errorTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  errorSub: {
    fontSize: FontSize.sm,
  },
  previewCard: {
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  thumbnailWrap: {
    aspectRatio: 16 / 9,
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  previewTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  previewDuration: {
    fontSize: FontSize.sm,
  },
  previewChannel: {
    fontSize: FontSize.sm,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    fontSize: FontSize.sm,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: FontSize.sm,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    padding: Spacing.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  importButton: {
    flex: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  importText: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  processingState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    gap: Spacing.md,
  },
  processingText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  processingSubtext: {
    fontSize: FontSize.sm,
  },
});
