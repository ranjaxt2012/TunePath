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
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Paths, File } from 'expo-file-system';
import { useTheme, Spacing, FontSize, Radius } from '@/src/design';
import { useAuthStore } from '@/src/store/authStore';
import { api, setAuthToken } from '@/src/services/api';
import { useAuth } from '@clerk/clerk-expo';
import { VideoView, useVideoPlayer } from 'expo-video';

const WEB_CONTENT_MAX = 960;
const SARGAM_NOTES = ['Sa', 'Re', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni'] as const;
function draftsJsonFile(): File {
  return new File(Paths.document, 'tunepath_drafts.json');
}

interface Draft {
  id: string;
  videoUri: string;
  title: string;
  notation: string;
  createdAt: string;
}

interface DetectedNote {
  note: string;
  octave: number;
  confidence: number;
}

type YtStep = 'url' | 'notation' | 'confirm' | 'processing';

// ── Draft helpers ─────────────────────────────────────────────────────────────
async function loadDrafts(): Promise<Draft[]> {
  try {
    const file = draftsJsonFile();
    if (!file.exists) return [];
    const raw = await file.text();
    return JSON.parse(raw) as Draft[];
  } catch {
    return [];
  }
}
async function saveDrafts(drafts: Draft[]) {
  const file = draftsJsonFile();
  if (!file.exists) {
    file.create({ intermediates: true });
  }
  file.write(JSON.stringify(drafts));
}
async function addDraft(draft: Draft) {
  const existing = await loadDrafts();
  await saveDrafts([draft, ...existing]);
}
async function removeDraft(id: string): Promise<Draft[]> {
  const updated = (await loadDrafts()).filter((d) => d.id !== id);
  await saveDrafts(updated);
  return updated;
}

export default function CreateScreen() {
  const { theme } = useTheme();
  const { trustTier, dbUserId } = useAuthStore();
  const { getToken } = useAuth();
  const router = useRouter();

  // ── Drafts ────────────────────────────────────────────────────────────────
  const [drafts, setDrafts] = useState<Draft[]>([]);
  useEffect(() => {
    if (Platform.OS !== 'web') loadDrafts().then(setDrafts);
  }, []);

  // ── Local upload ──────────────────────────────────────────────────────────
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [pickedVideoUri, setPickedVideoUri] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadNotation, setUploadNotation] = useState('');
  const [uploadStep, setUploadStep] = useState<'preview' | 'details' | 'uploading'>('preview');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const localVideoPlayer = useVideoPlayer(pickedVideoUri ?? '', (p) => { p.loop = true; });

  // ── YouTube import ────────────────────────────────────────────────────────
  const [ytModalVisible, setYtModalVisible] = useState(false);
  const [ytStep, setYtStep] = useState<YtStep>('url');
  const [ytUrl, setYtUrl] = useState('');
  const [ytLoading, setYtLoading] = useState(false);
  const [ytPreview, setYtPreview] = useState<{
    title: string; duration_seconds: number;
    thumbnail_url: string; channel: string; video_id: string;
  } | null>(null);
  const [ytError, setYtError] = useState<string | null>(null);

  // ── Detect notation (Celery + polling) ───────────────────────────────────
  const [detecting, setDetecting] = useState(false);
  const [detectTaskId, setDetectTaskId] = useState<string | null>(null);
  const [detectError, setDetectError] = useState<string | null>(null);
  const [detectedNotes, setDetectedNotes] = useState<DetectedNote[]>([]);
  const [editingChipIdx, setEditingChipIdx] = useState<number | null>(null);
  const [manualNotation, setManualNotation] = useState('');
  const [notationMode, setNotationMode] = useState<'chips' | 'text'>('text');
  const detectPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── YouTube processing ────────────────────────────────────────────────────
  const [ytConfirmed, setYtConfirmed] = useState(false);
  const [processingLessonId, setProcessingLessonId] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState('');
  const [aiSyncing, setAiSyncing] = useState(false);
  const [defaultCourse, setDefaultCourse] = useState<{
    course_id: string; instrument_id: string; level_id: string;
  } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load default course ───────────────────────────────────────────────────
  useEffect(() => {
    if (!ytModalVisible) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        setAuthToken(token);
        const [courses, instruments, levels] = await Promise.all([
          api.get<{ id: string; instrument_slug: string; level_slug: string; tutor_id: string }[]>('/api/courses?limit=50'),
          api.get<{ id: string; slug: string }[]>('/api/instruments'),
          api.get<{ id: string; slug: string }[]>('/api/levels'),
        ]);
        if (cancelled) return;
        const instMap = Object.fromEntries(instruments.map((i) => [i.slug, i.id]));
        const lvlMap = Object.fromEntries(levels.map((l) => [l.slug, l.id]));
        const first = courses.find((c) => c.tutor_id === dbUserId) ?? courses[0];
        if (first && instMap[first.instrument_slug] && lvlMap[first.level_slug]) {
          setDefaultCourse({ course_id: first.id, instrument_id: instMap[first.instrument_slug], level_id: lvlMap[first.level_slug] });
        }
      } catch { if (!cancelled) setDefaultCourse(null); }
    })();
    return () => { cancelled = true; };
  }, [ytModalVisible, getToken, dbUserId]);

  // ── Poll lesson processing status ─────────────────────────────────────────
  useEffect(() => {
    if (!processingLessonId) return;
    pollRef.current = setInterval(async () => {
      try {
        const data = await api.get<{ status: string }>(`/api/tutor/lessons/${processingLessonId}/status`);
        setProcessingStatus(data.status);
        if (data.status === 'review_ready') {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          const notation = getYtNotation();
          if (notation.trim()) {
            setAiSyncing(true);
            try { await api.post(`/api/tutor/lessons/${processingLessonId}/ai-sync`, { notation, shruti: 'C' }); }
            catch { }
            finally { setAiSyncing(false); }
          }
          const lessonId = processingLessonId;
          setYtModalVisible(false);
          resetYtModal();
          router.push(`/lesson/${lessonId}`);
        } else if (data.status === 'failed') {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          setYtModalVisible(false);
          resetYtModal();
          Alert.alert('Processing failed', 'Something went wrong. Please try again.');
        }
      } catch { }
    }, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processingLessonId]);

  // ── Poll detect-notation task ─────────────────────────────────────────────
  useEffect(() => {
    if (!detectTaskId) return;
    detectPollRef.current = setInterval(async () => {
      try {
        const data = await api.get<{
          status: string;
          notes?: DetectedNote[];
          message?: string;
          error?: string;
        }>(`/api/tutor/youtube/detect-status/${detectTaskId}`);

        if (data.status === 'done' && data.notes) {
          clearInterval(detectPollRef.current!);
          detectPollRef.current = null;
          setDetectTaskId(null);
          setDetecting(false);
          setDetectedNotes(data.notes);
          setNotationMode('chips');
        } else if (data.status === 'failed') {
          clearInterval(detectPollRef.current!);
          detectPollRef.current = null;
          setDetectTaskId(null);
          setDetecting(false);
          setDetectError(data.error ?? 'Detection failed. Enter notes manually.');
          setNotationMode('text');
        }
        // status === 'pending' → keep polling
      } catch { }
    }, 3000);
    return () => { if (detectPollRef.current) clearInterval(detectPollRef.current); };
  }, [detectTaskId]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getYtNotation = () =>
    notationMode === 'chips' && detectedNotes.length > 0
      ? detectedNotes.map((n) => n.note).join(' ')
      : manualNotation;

  const resetYtModal = () => {
    setYtStep('url'); setYtUrl(''); setYtPreview(null); setYtError(null);
    setDetecting(false); setDetectTaskId(null); setDetectError(null);
    setDetectedNotes([]); setEditingChipIdx(null);
    setManualNotation(''); setNotationMode('text');
    setYtConfirmed(false); setProcessingLessonId(null);
    setProcessingStatus(''); setAiSyncing(false); setYtLoading(false);
    if (detectPollRef.current) { clearInterval(detectPollRef.current); detectPollRef.current = null; }
  };

  const isValidYtUrl = (s: string) => s.includes('youtube.com') || s.includes('youtu.be');

  // ── Pick video from library ───────────────────────────────────────────────
  const handlePickVideo = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not supported', 'Please use YouTube import on web.');
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'TunePath needs access to your library to upload videos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      quality: 1,
    });
    if (result.canceled || !result.assets?.[0]) return;
    setPickedVideoUri(result.assets[0].uri);
    setUploadTitle('');
    setUploadNotation('');
    setUploadStep('preview');
    setUploadError(null);
    setUploadModalVisible(true);
  };

  // ── Draft actions ─────────────────────────────────────────────────────────
  const handleSaveDraft = async () => {
    if (!pickedVideoUri) return;
    const draft: Draft = {
      id: Date.now().toString(),
      videoUri: pickedVideoUri,
      title: uploadTitle || 'Untitled lesson',
      notation: uploadNotation,
      createdAt: new Date().toISOString(),
    };
    await addDraft(draft);
    setDrafts(await loadDrafts());
    setUploadModalVisible(false);
    Alert.alert('Draft saved', 'You can upload it later from Drafts.');
  };

  const handleDeleteDraft = (id: string) => {
    Alert.alert('Delete draft?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => setDrafts(await removeDraft(id)) },
    ]);
  };

  const handleUploadDraft = (draft: Draft) => {
    setPickedVideoUri(draft.videoUri);
    setUploadTitle(draft.title);
    setUploadNotation(draft.notation);
    setUploadStep('details');
    setUploadModalVisible(true);
  };

  // ── Local upload ──────────────────────────────────────────────────────────
  const handleUploadLocal = async () => {
    if (!pickedVideoUri || !defaultCourse) return;
    setUploading(true);
    setUploadError(null);
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append(
        'video',
        { uri: pickedVideoUri, name: 'lesson.mp4', type: 'video/mp4' } as unknown as Blob
      );
      formData.append('title', uploadTitle || 'My lesson');
      formData.append('course_id', defaultCourse.course_id);
      formData.append('instrument_id', defaultCourse.instrument_id);
      formData.append('level_id', defaultCourse.level_id);
      formData.append('shruti', 'C');
      const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/tutor/lessons/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await result.json();
      if (!result.ok) throw new Error(data.detail ?? 'Upload failed');
      setUploadModalVisible(false);
      router.push(`/lesson/${data.lesson_id}`);
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed. Try again.');
    } finally { setUploading(false); }
  };

  // ── YT Preview ───────────────────────────────────────────────────────────
  const handleYtPreview = async () => {
    const url = ytUrl.trim();
    if (!url || !isValidYtUrl(url)) return;
    setYtLoading(true); setYtError(null); setYtPreview(null);
    try {
      const token = await getToken();
      setAuthToken(token);
      const data = await api.get<{ title: string; duration_seconds: number; thumbnail_url: string; channel: string; video_id: string; }>(
        `/api/tutor/youtube/preview?url=${encodeURIComponent(url)}`
      );
      setYtPreview(data);
    } catch { setYtError('Could not load preview. Check the URL and try again.'); }
    finally { setYtLoading(false); }
  };

  // ── Start detect (fires Celery task) ─────────────────────────────────────
  const handleDetectNotation = async () => {
    setDetecting(true);
    setDetectError(null);
    setDetectedNotes([]);
    setDetectTaskId(null);
    if (detectPollRef.current) { clearInterval(detectPollRef.current); detectPollRef.current = null; }
    try {
      const token = await getToken();
      setAuthToken(token);
      const result = await api.post<{ task_id: string; message: string }>(
        '/api/tutor/youtube/detect-notation',
        { youtube_url: ytUrl.trim(), shruti: 'C', max_notes: 64 }
      );
      setDetectTaskId(result.task_id);
      // Polling starts via useEffect watching detectTaskId
    } catch (e: unknown) {
      setDetecting(false);
      setDetectError(
        e instanceof Error ? e.message : 'Could not start detection. Enter notes manually.'
      );
      setNotationMode('text');
    }
  };

  const handleChipChange = (idx: number, note: string) => {
    setDetectedNotes((p) => { const u = [...p]; u[idx] = { ...u[idx], note, confidence: 1.0 }; return u; });
    setEditingChipIdx(null);
  };
  const handleDeleteChip = (idx: number) => { setDetectedNotes((p) => p.filter((_, i) => i !== idx)); setEditingChipIdx(null); };

  // ── YT Import ────────────────────────────────────────────────────────────
  const handleYtImport = async () => {
    if (!ytUrl.trim() || !ytConfirmed || !defaultCourse) return;
    setYtStep('processing'); setProcessingStatus('queued');
    try {
      const token = await getToken();
      setAuthToken(token);
      const result = await api.post<{ lesson_id: string }>('/api/tutor/lessons/upload-youtube', {
        youtube_url: ytUrl.trim(),
        confirmed_own_content: ytConfirmed,
        course_id: defaultCourse.course_id,
        instrument_id: defaultCourse.instrument_id,
        level_id: defaultCourse.level_id,
      });
      setProcessingLessonId(result.lesson_id);
    } catch (e: unknown) {
      Alert.alert(
        'Import failed',
        e instanceof Error ? e.message : 'Something went wrong'
      );
      setYtStep('confirm');
    }
  };

  const formatDuration = (sec: number) => `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;

  const processingLabel = () => {
    if (aiSyncing) return 'AI is timing your notes…';
    switch (processingStatus) {
      case 'queued': return 'Queued for processing…';
      case 'processing': return 'Analysing audio…';
      default: return 'Processing your lesson…';
    }
  };

  const YtStepDots = () => (
    <View style={styles.stepDots}>
      {(['url', 'notation', 'confirm'] as YtStep[]).map((s, i) => (
        <View key={s} style={[styles.stepDot, {
          backgroundColor: ytStep === s ? theme.primary
            : ['notation', 'confirm', 'processing'].indexOf(ytStep) > i ? theme.success
            : theme.border,
        }]} />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.flex} contentContainerStyle={[styles.container, Platform.OS === 'web' && styles.webContainer]} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Share music 🎵</Text>

        {trustTier === 'verified' && (
          <View style={[styles.verifiedCard, { backgroundColor: theme.surface, borderColor: theme.success, borderRadius: Radius.lg }]}>
            <Text style={[styles.verifiedBadge, { color: theme.success }]}>✓ Verified Creator</Text>
            <Text style={[styles.verifiedSub, { color: theme.textSecondary }]}>Your uploads are published instantly</Text>
          </View>
        )}

        <View style={styles.optionsStack}>
          <TouchableOpacity style={[styles.optionCard, { backgroundColor: theme.surface, borderRadius: Radius.xl, borderColor: theme.border }]}
            onPress={() => Alert.alert('Coming soon', 'Camera recording coming in the next update.')}>
            <View style={styles.optionLeft}>
              <Text style={styles.optionEmoji}>📹</Text>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: theme.textPrimary }]}>Record a video</Text>
                <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>Use your camera</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textDisabled} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionCard, { backgroundColor: theme.surface, borderRadius: Radius.xl, borderColor: theme.border }]}
            onPress={handlePickVideo}>
            <View style={styles.optionLeft}>
              <Text style={styles.optionEmoji}>📁</Text>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: theme.textPrimary }]}>Upload from library</Text>
                <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>Share your recordings</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textDisabled} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionCard, { backgroundColor: theme.surface, borderRadius: Radius.xl, borderColor: theme.border }]}
            onPress={() => { resetYtModal(); setYtModalVisible(true); }}>
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

        {/* ── Drafts ──────────────────────────────────────────────────── */}
        {drafts.length > 0 && Platform.OS !== 'web' && (
          <View style={styles.draftsSection}>
            <Text style={[styles.draftsTitle, { color: theme.textPrimary }]}>Drafts</Text>
            {drafts.map((draft) => (
              <View key={draft.id} style={[styles.draftCard, { backgroundColor: theme.surface, borderColor: theme.border, borderRadius: Radius.lg }]}>
                <View style={styles.draftInfo}>
                  <Text style={[styles.draftTitle, { color: theme.textPrimary }]} numberOfLines={1}>{draft.title}</Text>
                  <Text style={[styles.draftMeta, { color: theme.textDisabled }]}>
                    {new Date(draft.createdAt).toLocaleDateString()}
                    {draft.notation ? ` · ${draft.notation.split(' ').length} notes` : ''}
                  </Text>
                </View>
                <View style={styles.draftActions}>
                  <TouchableOpacity style={[styles.draftBtn, { backgroundColor: theme.primary + '15', borderColor: theme.primary }]} onPress={() => handleUploadDraft(draft)}>
                    <Text style={{ color: theme.primary, fontSize: FontSize.xs, fontWeight: '700' }}>Upload</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.draftBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => handleDeleteDraft(draft.id)}>
                    <Text style={{ color: theme.error, fontSize: FontSize.xs }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── LOCAL UPLOAD MODAL ──────────────────────────────────────────── */}
      <Modal visible={uploadModalVisible} animationType="slide" onRequestClose={() => { if (!uploading) setUploadModalVisible(false); }}>
        <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
          <View style={[styles.modalNavBar, { borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => { if (!uploading) setUploadModalVisible(false); }} style={[styles.navBarBtn, { backgroundColor: theme.surface }]}>
              <Ionicons name="chevron-back" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.navBarTitle, { color: theme.textPrimary }]}>
              {uploadStep === 'preview' ? 'Preview' : 'Lesson details'}
            </Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView style={styles.flex} contentContainerStyle={styles.uploadScrollContent}>
            {uploadStep === 'preview' && pickedVideoUri && (
              <>
                <View style={[styles.localVideoWrap, { backgroundColor: theme.divider }]}>
                  <VideoView player={localVideoPlayer} style={styles.localVideo} contentFit="contain" nativeControls />
                </View>
                <View style={styles.previewActions}>
                  <TouchableOpacity style={[styles.previewActionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => setUploadModalVisible(false)}>
                    <Ionicons name="trash-outline" size={18} color={theme.error} />
                    <Text style={{ color: theme.error, fontSize: FontSize.sm, fontWeight: '600' }}>Discard</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.previewActionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={handleSaveDraft}>
                    <Ionicons name="bookmark-outline" size={18} color={theme.textSecondary} />
                    <Text style={{ color: theme.textSecondary, fontSize: FontSize.sm, fontWeight: '600' }}>Save Draft</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.previewActionBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]} onPress={() => setUploadStep('details')}>
                    <Ionicons name="arrow-forward" size={18} color={theme.textOnPrimary} />
                    <Text style={{ color: theme.textOnPrimary, fontSize: FontSize.sm, fontWeight: '700' }}>Continue</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {(uploadStep === 'details' || uploadStep === 'uploading') && (
              <>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Lesson title</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border, borderRadius: Radius.md }]}
                  placeholder="e.g. Sa Re Ga Ma — Beginner scale"
                  placeholderTextColor={theme.textDisabled}
                  value={uploadTitle}
                  onChangeText={setUploadTitle}
                />
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                  Notation <Text style={{ color: theme.textDisabled }}>(optional)</Text>
                </Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border, borderRadius: Radius.md, minHeight: 80, textAlignVertical: 'top' }]}
                  placeholder="Sa Re Ga Ma Pa Dha Ni Sa"
                  placeholderTextColor={theme.textDisabled}
                  value={uploadNotation}
                  onChangeText={setUploadNotation}
                  multiline autoCapitalize="words" autoCorrect={false}
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 44, marginBottom: Spacing.lg }} contentContainerStyle={{ gap: Spacing.sm }}>
                  {SARGAM_NOTES.map((note) => (
                    <TouchableOpacity key={note} style={[styles.quickNoteBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                      onPress={() => setUploadNotation((p) => p ? `${p.trimEnd()} ${note}` : note)}>
                      <Text style={{ color: theme.primary, fontWeight: '700', fontSize: FontSize.sm }}>{note}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {uploadError && <Text style={[styles.errorText, { color: theme.error }]}>{uploadError}</Text>}
                <View style={styles.detailsActions}>
                  <TouchableOpacity style={[styles.detailsBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={handleSaveDraft} disabled={uploading}>
                    <Ionicons name="bookmark-outline" size={16} color={theme.textSecondary} />
                    <Text style={{ color: theme.textSecondary, fontSize: FontSize.sm, fontWeight: '600' }}>Save Draft</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.detailsBtn, { flex: 2, backgroundColor: defaultCourse && !uploading ? theme.primary : theme.surface, borderColor: defaultCourse ? theme.primary : theme.border }]}
                    onPress={handleUploadLocal} disabled={!defaultCourse || uploading}>
                    {uploading ? <ActivityIndicator size="small" color={theme.textOnPrimary} /> : <Ionicons name="cloud-upload-outline" size={16} color={defaultCourse ? theme.textOnPrimary : theme.textDisabled} />}
                    <Text style={{ color: defaultCourse && !uploading ? theme.textOnPrimary : theme.textDisabled, fontSize: FontSize.sm, fontWeight: '700' }}>
                      {uploading ? 'Uploading…' : 'Upload ↑'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ── YOUTUBE IMPORT MODAL ─────────────────────────────────────────── */}
      <Modal visible={ytModalVisible} transparent animationType="slide"
        onRequestClose={() => { if (ytStep !== 'processing') { setYtModalVisible(false); resetYtModal(); } }}>
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.ytSheet, { backgroundColor: theme.modalBg, borderRadius: Radius.xl }]}>
            <View style={styles.modalHandle}>
              <View style={[styles.handleBar, { backgroundColor: theme.border }]} />
            </View>

            {ytStep === 'processing' ? (
              <View style={styles.processingState}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.processingText, { color: theme.textPrimary }]}>{processingLabel()}</Text>
                <Text style={[styles.processingSubtext, { color: theme.textDisabled }]}>
                  {aiSyncing ? 'Matching notes to audio' : 'CREPE detecting pitches · Whisper transcribing'}
                </Text>
              </View>
            ) : (
              <>
                <YtStepDots />

                {/* STEP 1 — URL */}
                {ytStep === 'url' && (
                  <>
                    <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Import from YouTube</Text>
                    <View style={styles.urlInputRow}>
                      <TextInput
                        style={[styles.urlInput, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border, borderRadius: Radius.md }]}
                        placeholder="Paste YouTube URL here..."
                        placeholderTextColor={theme.textDisabled}
                        value={ytUrl}
                        onChangeText={(t) => { setYtUrl(t); setYtPreview(null); setYtError(null); }}
                        autoCapitalize="none" autoCorrect={false} keyboardType="url"
                      />
                      {ytUrl.length > 0 && (
                        <TouchableOpacity onPress={() => { setYtUrl(''); setYtPreview(null); setYtError(null); }}>
                          <Text style={[styles.clearBtnText, { color: theme.textSecondary }]}>×</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <TouchableOpacity
                      style={[styles.previewButton, { backgroundColor: isValidYtUrl(ytUrl) ? theme.primary : theme.surface, borderColor: theme.border, borderRadius: Radius.md }]}
                      onPress={handleYtPreview} disabled={!isValidYtUrl(ytUrl) || ytLoading}>
                      {ytLoading ? <ActivityIndicator size="small" color={theme.textOnPrimary} /> :
                        <Text style={{ color: isValidYtUrl(ytUrl) ? theme.textOnPrimary : theme.textDisabled, fontWeight: '600', fontSize: FontSize.md }}>Preview</Text>}
                    </TouchableOpacity>
                    {ytError && <Text style={[styles.errorText, { color: theme.error }]}>{ytError}</Text>}
                    {ytPreview && (
                      <View style={[styles.ytPreviewCard, { backgroundColor: theme.surface, borderRadius: Radius.lg, borderColor: theme.border }]}>
                        <View style={styles.thumbnailWrap}>
                          <Image source={{ uri: ytPreview.thumbnail_url }} style={styles.thumbnail} resizeMode="cover" />
                        </View>
                        <Text style={[styles.previewTitle, { color: theme.textPrimary }]} numberOfLines={2}>{ytPreview.title}</Text>
                        <Text style={[styles.previewMeta, { color: theme.textSecondary }]}>{formatDuration(ytPreview.duration_seconds)} · {ytPreview.channel}</Text>
                      </View>
                    )}
                    <View style={styles.sheetActions}>
                      <TouchableOpacity style={[styles.cancelButton, { borderColor: theme.border, borderRadius: Radius.md }]}
                        onPress={() => { setYtModalVisible(false); resetYtModal(); }}>
                        <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.nextButton, { backgroundColor: ytPreview ? theme.primary : theme.surface, borderRadius: Radius.md }]}
                        onPress={() => { if (ytPreview) setYtStep('notation'); }} disabled={!ytPreview}>
                        <Text style={{ color: ytPreview ? theme.textOnPrimary : theme.textDisabled, fontWeight: '700', fontSize: FontSize.md }}>Next →</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {/* STEP 2 — NOTATION */}
                {ytStep === 'notation' && (
                  <>
                    <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Notation</Text>
                    <Text style={[styles.sheetSubtitle, { color: theme.textSecondary }]}>
                      Detect notes from audio, or type manually.
                    </Text>

                    {/* Detect button — only show if not already detecting or done */}
                    {!detecting && detectedNotes.length === 0 && (
                      <TouchableOpacity
                        style={[styles.detectBtn, { backgroundColor: theme.primary + '15', borderColor: theme.primary }]}
                        onPress={handleDetectNotation}>
                        <Text style={{ fontSize: 18 }}>✨</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: theme.primary, fontWeight: '700', fontSize: FontSize.md }}>Detect from audio</Text>
                          <Text style={{ color: theme.textDisabled, fontSize: FontSize.xs }}>~20 seconds · CREPE pitch detection</Text>
                        </View>
                      </TouchableOpacity>
                    )}

                    {/* Detecting — spinner with status */}
                    {detecting && (
                      <View style={[styles.detectingRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <ActivityIndicator size="small" color={theme.primary} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: theme.textPrimary, fontSize: FontSize.sm, fontWeight: '600' }}>
                            Analysing audio…
                          </Text>
                          <Text style={{ color: theme.textDisabled, fontSize: FontSize.xs }}>
                            CREPE is detecting pitches on the worker
                          </Text>
                        </View>
                        <TouchableOpacity onPress={() => {
                          if (detectPollRef.current) { clearInterval(detectPollRef.current); detectPollRef.current = null; }
                          setDetecting(false); setDetectTaskId(null);
                          setNotationMode('text');
                        }}>
                          <Text style={{ color: theme.textDisabled, fontSize: FontSize.xs }}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {detectError && <Text style={[styles.errorText, { color: theme.error }]}>{detectError}</Text>}

                    {/* Chips mode */}
                    {notationMode === 'chips' && detectedNotes.length > 0 && (
                      <>
                        <View style={styles.chipsHeader}>
                          <Text style={{ color: theme.textSecondary, fontSize: FontSize.xs }}>
                            {detectedNotes.length} notes · tap to edit · long press to delete
                          </Text>
                          <TouchableOpacity onPress={handleDetectNotation}>
                            <Text style={{ color: theme.primary, fontSize: FontSize.xs, fontWeight: '600' }}>Re-detect ↺</Text>
                          </TouchableOpacity>
                        </View>
                        <ScrollView style={{ maxHeight: 160 }} showsVerticalScrollIndicator={false}>
                          <View style={styles.chipsWrap}>
                            {detectedNotes.map((note, idx) => {
                              const isEditing = editingChipIdx === idx;
                              const color =
                                note.confidence >= 0.85
                                  ? theme.success
                                  : note.confidence >= 0.6
                                    ? theme.warning
                                    : theme.error;
                              return (
                                <View key={idx}>
                                  <TouchableOpacity
                                    style={[styles.noteChip, { backgroundColor: isEditing ? theme.primary + '20' : color + '15', borderColor: isEditing ? theme.primary : color, borderWidth: isEditing ? 2 : 1.5 }]}
                                    onPress={() => setEditingChipIdx(isEditing ? null : idx)}
                                    onLongPress={() => handleDeleteChip(idx)}>
                                    <Text style={{ color: isEditing ? theme.primary : color, fontSize: FontSize.xs, fontWeight: '700' }}>{note.note}</Text>
                                  </TouchableOpacity>
                                  {isEditing && (
                                    <View style={[styles.notePicker, { backgroundColor: theme.modalBg, borderColor: theme.primary }]}>
                                      {SARGAM_NOTES.map((n) => (
                                        <TouchableOpacity key={n} style={[styles.notePickerItem, { backgroundColor: note.note === n ? theme.primary + '20' : 'transparent' }]}
                                          onPress={() => handleChipChange(idx, n)}>
                                          <Text style={{ color: note.note === n ? theme.primary : theme.textPrimary, fontWeight: note.note === n ? '700' : '400', fontSize: FontSize.sm }}>{n}</Text>
                                        </TouchableOpacity>
                                      ))}
                                      <TouchableOpacity style={[styles.notePickerItem, { borderTopWidth: 0.5, borderTopColor: theme.border }]} onPress={() => handleDeleteChip(idx)}>
                                        <Text style={{ color: theme.error, fontSize: FontSize.sm }}>Delete ✕</Text>
                                      </TouchableOpacity>
                                    </View>
                                  )}
                                </View>
                              );
                            })}
                            <TouchableOpacity style={[styles.addNoteBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
                              onPress={() => setDetectedNotes((p) => [...p, { note: 'Sa', octave: 0, confidence: 1.0 }])}>
                              <Text style={{ color: theme.textDisabled, fontSize: FontSize.sm }}>+ Sa</Text>
                            </TouchableOpacity>
                          </View>
                        </ScrollView>
                        <TouchableOpacity onPress={() => { setManualNotation(detectedNotes.map((n) => n.note).join(' ')); setNotationMode('text'); }}>
                          <Text style={{ color: theme.textDisabled, fontSize: FontSize.xs, textAlign: 'center', marginTop: Spacing.xs }}>Switch to text mode</Text>
                        </TouchableOpacity>
                      </>
                    )}

                    {/* Text mode */}
                    {notationMode === 'text' && !detecting && (
                      <>
                        <TextInput
                          style={[styles.notationInput, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: manualNotation.trim() ? theme.primary : theme.border, borderRadius: Radius.md }]}
                          placeholder="Sa Re Ga Ma Pa Dha Ni Sa"
                          placeholderTextColor={theme.textDisabled}
                          value={manualNotation}
                          onChangeText={setManualNotation}
                          autoCapitalize="words" autoCorrect={false} multiline
                        />
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 44, marginBottom: Spacing.sm }} contentContainerStyle={{ gap: Spacing.sm }}>
                          {SARGAM_NOTES.map((note) => (
                            <TouchableOpacity key={note} style={[styles.quickNoteBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                              onPress={() => setManualNotation((p) => p ? `${p.trimEnd()} ${note}` : note)}>
                              <Text style={{ color: theme.primary, fontWeight: '700', fontSize: FontSize.sm }}>{note}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                        {detectedNotes.length > 0 && (
                          <TouchableOpacity onPress={() => setNotationMode('chips')}>
                            <Text style={{ color: theme.primary, fontSize: FontSize.xs, textAlign: 'center' }}>Switch back to chips</Text>
                          </TouchableOpacity>
                        )}
                      </>
                    )}

                    <View style={[styles.sheetActions, { marginTop: Spacing.md }]}>
                      <TouchableOpacity style={[styles.cancelButton, { borderColor: theme.border, borderRadius: Radius.md }]} onPress={() => setYtStep('url')}>
                        <Text style={[styles.cancelText, { color: theme.textSecondary }]}>← Back</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.nextButton, { backgroundColor: theme.primary, borderRadius: Radius.md }]} onPress={() => setYtStep('confirm')} disabled={detecting}>
                        <Text style={{ color: theme.textOnPrimary, fontWeight: '700', fontSize: FontSize.md }}>
                          {getYtNotation().trim() ? 'Next →' : 'Skip →'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {/* STEP 3 — CONFIRM */}
                {ytStep === 'confirm' && (
                  <>
                    <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Ready to import</Text>
                    {ytPreview && (
                      <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border, borderRadius: Radius.lg }]}>
                        <Text style={[styles.previewTitle, { color: theme.textPrimary }]} numberOfLines={2}>{ytPreview.title}</Text>
                        <Text style={[styles.previewMeta, { color: theme.textSecondary }]}>{formatDuration(ytPreview.duration_seconds)} · {ytPreview.channel}</Text>
                        {getYtNotation().trim() !== '' && (
                          <View style={[styles.notationPreview, { backgroundColor: theme.primary + '12', borderRadius: Radius.sm }]}>
                            <Text style={{ fontSize: FontSize.xs, color: theme.textDisabled, marginBottom: 2 }}>✨ AI will time:</Text>
                            <Text style={{ fontSize: FontSize.sm, color: theme.primary, fontWeight: '600' }} numberOfLines={3}>{getYtNotation().trim()}</Text>
                          </View>
                        )}
                      </View>
                    )}
                    <TouchableOpacity style={styles.checkboxRow} onPress={() => setYtConfirmed((v) => !v)} activeOpacity={0.7}>
                      <View style={[styles.checkbox, { borderColor: ytConfirmed ? theme.primary : theme.border, backgroundColor: ytConfirmed ? theme.primary : 'transparent', borderRadius: Radius.sm }]}>
                        {ytConfirmed && <Text style={[styles.checkMark, { color: theme.textOnPrimary }]}>✓</Text>}
                      </View>
                      <Text style={[styles.checkboxLabel, { color: theme.textSecondary }]}>I confirm I own this content</Text>
                    </TouchableOpacity>
                    <View style={styles.sheetActions}>
                      <TouchableOpacity style={[styles.cancelButton, { borderColor: theme.border, borderRadius: Radius.md }]} onPress={() => setYtStep('notation')}>
                        <Text style={[styles.cancelText, { color: theme.textSecondary }]}>← Back</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.nextButton, { backgroundColor: ytConfirmed && defaultCourse ? theme.primary : theme.surface, borderRadius: Radius.md }]}
                        onPress={handleYtImport} disabled={!ytConfirmed || !defaultCourse}>
                        <Text style={{ color: ytConfirmed && defaultCourse ? theme.textOnPrimary : theme.textDisabled, fontWeight: '700', fontSize: FontSize.md }}>Import ↑</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { paddingHorizontal: Spacing.lg, paddingBottom: 48 },
  webContainer: { maxWidth: WEB_CONTENT_MAX, alignSelf: 'center', width: '100%' },
  title: { fontSize: FontSize.xl, fontWeight: 'bold', marginTop: Spacing.lg, marginBottom: Spacing.xl },
  verifiedCard: { padding: Spacing.md, borderWidth: 1, marginBottom: Spacing.xl },
  verifiedBadge: { fontSize: FontSize.md, fontWeight: '700', marginBottom: Spacing.xs },
  verifiedSub: { fontSize: FontSize.sm },
  optionsStack: { gap: Spacing.md },
  optionCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, borderWidth: 1 },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  optionEmoji: { fontSize: FontSize.xxl, width: 36, textAlign: 'center' },
  optionText: { flex: 1, gap: Spacing.xs },
  optionTitle: { fontSize: FontSize.md, fontWeight: '600' },
  optionDesc: { fontSize: FontSize.sm },
  draftsSection: { marginTop: Spacing.xl },
  draftsTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.md },
  draftCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderWidth: 1, marginBottom: Spacing.sm },
  draftInfo: { flex: 1 },
  draftTitle: { fontSize: FontSize.sm, fontWeight: '600' },
  draftMeta: { fontSize: FontSize.xs, marginTop: 2 },
  draftActions: { flexDirection: 'row', gap: Spacing.sm },
  draftBtn: { paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: Radius.sm, borderWidth: 1 },
  modalNavBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, height: 52, borderBottomWidth: 0.5 },
  navBarBtn: { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  navBarTitle: { fontSize: FontSize.md, fontWeight: '600' },
  uploadScrollContent: { padding: Spacing.lg, paddingBottom: 48 },
  localVideoWrap: { aspectRatio: 16 / 9, borderRadius: Radius.lg, overflow: 'hidden', marginBottom: Spacing.lg },
  localVideo: { flex: 1 },
  previewActions: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  previewActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.md, borderRadius: Radius.lg, borderWidth: 1 },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.xs, marginTop: Spacing.md },
  fieldInput: { padding: Spacing.md, fontSize: FontSize.md, borderWidth: 1, marginBottom: Spacing.xs },
  quickNoteBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md, borderWidth: 1 },
  detailsActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
  detailsBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.md, borderRadius: Radius.lg, borderWidth: 1 },
  errorText: { fontSize: FontSize.sm, marginBottom: Spacing.md },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  ytSheet: { padding: Spacing.xl, paddingBottom: 48, minHeight: 460 },
  modalHandle: { alignItems: 'center', marginBottom: Spacing.md },
  handleBar: { width: 40, height: 4, borderRadius: 2 },
  sheetTitle: { fontSize: FontSize.xl, fontWeight: 'bold', marginBottom: Spacing.sm },
  sheetSubtitle: { fontSize: FontSize.sm, marginBottom: Spacing.md },
  stepDots: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'center', marginBottom: Spacing.lg },
  stepDot: { width: 8, height: 8, borderRadius: 4 },
  urlInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, gap: Spacing.sm },
  urlInput: { flex: 1, padding: Spacing.md, fontSize: FontSize.md, borderWidth: 1 },
  clearBtnText: { fontSize: 24, width: 36, textAlign: 'center' },
  previewButton: { padding: Spacing.md, borderWidth: 1, alignItems: 'center', marginBottom: Spacing.md },
  ytPreviewCard: { padding: Spacing.md, borderWidth: 1, marginBottom: Spacing.md },
  thumbnailWrap: { aspectRatio: 16 / 9, borderRadius: Radius.md, overflow: 'hidden', marginBottom: Spacing.sm },
  thumbnail: { width: '100%', height: '100%' },
  previewTitle: { fontSize: FontSize.md, fontWeight: '600' },
  previewMeta: { fontSize: FontSize.sm },
  detectBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1.5, marginBottom: Spacing.md },
  detectingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, marginBottom: Spacing.md },
  chipsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  noteChip: { paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: Radius.sm, minWidth: 40, alignItems: 'center' },
  notePicker: { position: 'absolute', top: 36, left: 0, zIndex: 100, borderRadius: Radius.md, borderWidth: 1.5, minWidth: 80, overflow: 'hidden' },
  notePickerItem: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  addNoteBtn: { paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: Radius.sm, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center' },
  notationInput: { padding: Spacing.md, fontSize: FontSize.md, borderWidth: 1.5, minHeight: 80, marginBottom: Spacing.sm, textAlignVertical: 'top' },
  summaryCard: { padding: Spacing.md, borderWidth: 1, marginBottom: Spacing.lg, gap: Spacing.xs },
  notationPreview: { padding: Spacing.sm, marginTop: Spacing.xs },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.xl },
  checkbox: { width: 22, height: 22, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  checkMark: { fontSize: FontSize.sm, fontWeight: 'bold' },
  checkboxLabel: { flex: 1, fontSize: FontSize.sm },
  processingState: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.md },
  processingText: { fontSize: FontSize.lg, fontWeight: '600', textAlign: 'center' },
  processingSubtext: { fontSize: FontSize.sm, textAlign: 'center' },
  sheetActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
  cancelButton: { flex: 1, padding: Spacing.md, borderWidth: 1, alignItems: 'center' },
  cancelText: { fontSize: FontSize.md, fontWeight: '600' },
  nextButton: { flex: 1, padding: Spacing.md, alignItems: 'center' },
});