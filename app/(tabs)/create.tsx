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
  const { trustTier } = useAuthStore();
  const { getToken } = useAuth();

  const [ytModalVisible, setYtModalVisible] = useState(false);
  const [ytUrl, setYtUrl] = useState('');
  const [ytConfirmed, setYtConfirmed] = useState(false);
  const [ytLoading, setYtLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingLessonId, setProcessingLessonId] = useState<string | null>(null);
  const [ytPreview, setYtPreview] = useState<{ title: string; duration: string } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll lesson status every 5s while processing
  useEffect(() => {
    if (!processingLessonId) return;
    pollRef.current = setInterval(async () => {
      try {
        const data = await api.get<{ status: string }>(`/api/lessons/${processingLessonId}/status`);
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

  const openYouTubeModal = () => {
    setYtUrl('');
    setYtConfirmed(false);
    setYtPreview(null);
    setProcessing(false);
    setYtLoading(false);
    setYtModalVisible(true);
  };

  const handleYtUrlChange = async (url: string) => {
    setYtUrl(url);
    setYtPreview(null);
    if (!url.trim()) return;

    setYtLoading(true);
    try {
      const token = await getToken();
      setAuthToken(token);
      const data = await api.get<{ title: string; duration: string }>(
        `/api/tutor/youtube/preview?url=${encodeURIComponent(url)}`
      );
      setYtPreview(data);
    } catch {
      // preview is optional
    } finally {
      setYtLoading(false);
    }
  };

  const handleImport = async () => {
    if (!ytUrl.trim() || !ytConfirmed) return;
    setProcessing(true);
    try {
      const token = await getToken();
      setAuthToken(token);
      const result = await api.post<{ id: string }>('/api/tutor/lessons/upload-youtube', { url: ytUrl });
      setProcessingLessonId(result.id);
    } catch (e: any) {
      Alert.alert('Import failed', e.message ?? 'Something went wrong');
      setProcessing(false);
    }
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
                  placeholder="Paste YouTube URL..."
                  placeholderTextColor={theme.textDisabled}
                  value={ytUrl}
                  onChangeText={handleYtUrlChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />

                {ytLoading && (
                  <ActivityIndicator
                    size="small"
                    color={theme.primary}
                    style={styles.previewLoader}
                  />
                )}

                {ytPreview && !ytLoading && (
                  <View style={[styles.previewCard, { backgroundColor: theme.surface, borderRadius: Radius.lg, borderColor: theme.border }]}>
                    <Text style={[styles.previewTitle, { color: theme.textPrimary }]} numberOfLines={2}>
                      {ytPreview.title}
                    </Text>
                    <Text style={[styles.previewDuration, { color: theme.textSecondary }]}>
                      Duration: {ytPreview.duration}
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
                    I confirm this is my own content
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
                    disabled={!ytConfirmed || !ytUrl.trim()}
                  >
                    <Text
                      style={[
                        styles.importText,
                        {
                          color:
                            ytConfirmed && ytUrl.trim()
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
  urlInput: {
    padding: Spacing.md,
    fontSize: FontSize.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  previewLoader: {
    marginBottom: Spacing.md,
  },
  previewCard: {
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  previewTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  previewDuration: {
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
