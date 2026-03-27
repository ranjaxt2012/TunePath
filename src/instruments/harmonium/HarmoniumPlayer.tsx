import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useTheme, Spacing, FontSize, Radius } from '@/src/design';
import { useProgressStore } from '@/src/store/progressStore';
import { VideoPlayer, type VideoPlayerHandle } from './VideoPlayer';
import type { Note } from '@/src/hooks/useLesson';
import { NotationContainer } from './NotationContainer';
import { RowTimingEditor } from './RowTimingEditor';
import { SargamPlayerEngine } from './SargamPlayerEngine';
import { HARMONIUM_SAMPLE_MAP } from './sampleMap';
import type { Lesson } from '@/src/types/models';
import { api } from '@/src/services/api';
import { useOrientation } from '@/src/hooks/useOrientation';
import { Log } from '@/src/utils/log';

interface HarmoniumPlayerProps {
  lesson: Lesson;
  notes?: Note[];
  isTutor?: boolean;
  onComplete?(): void;
}

const MOCK_VIDEO_URL = require('../../../assets/instruments/harmonium/test_lesson.mp4');

function formatTimeMs(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${mins}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

function getRowNotes(notes: Note[], rowIndex: number): Note[] {
  const start = rowIndex * 8;
  return notes.slice(start, start + 8);
}

export function HarmoniumPlayer({ lesson, notes = [], isTutor, onComplete }: HarmoniumPlayerProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const { isLandscape } = useOrientation();
  const markComplete = useProgressStore((s) => s.markComplete);
  const isComplete = useProgressStore((s) => s.isComplete);
  const showSideBySide = isLandscape || Platform.OS === 'web';

  // ── State ─────────────────────────────────────────────────────────────
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [videoStarted, setVideoStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [localNotes, setLocalNotes] = useState<Note[]>(notes);
  const [currentTime, setCurrentTime] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [bpm, setBpm] = useState(80);
  const [firstBeat, setFirstBeat] = useState(0.2);
  const [snapToBeat, setSnapToBeat] = useState(true);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);

  useEffect(() => { setLocalNotes(notes); }, [notes]);

  // ── Refs ──────────────────────────────────────────────────────────────
  const engineRef = useRef<SargamPlayerEngine | null>(null);
  const lastSyncRef = useRef<number>(0);
  const lastSaveRef = useRef<number>(0);
  const currentTimeRef = useRef(0);
  const videoRef = useRef<VideoPlayerHandle | null>(null);

  // isPlayingRef: source of truth for play/pause logic.
  // isPlaying state: drives UI only.
  // Using a ref avoids stale closures in togglePlay and handlePlaybackStatus.
  const isPlayingRef = useRef(false);

  // playbackSpeedRef: keeps handlePlaybackStatus from needing playbackSpeed in deps
  const playbackSpeedRef = useRef(playbackSpeed);
  useEffect(() => { playbackSpeedRef.current = playbackSpeed; }, [playbackSpeed]);

  const savePosition = useProgressStore((s) => s.savePosition);
  const getPosition = useProgressStore((s) => s.getPosition);

  // ── Engine lifecycle ──────────────────────────────────────────────────
  useEffect(() => {
    const engine = new SargamPlayerEngine();
    engine.load(localNotes, HARMONIUM_SAMPLE_MAP);
    engine.setSoundEnabled(false); // sound off by default
    engine.onComplete = () => { onComplete?.(); };
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  // Run once on mount — note updates handled separately below
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (engineRef.current && localNotes.length > 0) {
      engineRef.current.load(localNotes, HARMONIUM_SAMPLE_MAP);
    }
  }, [localNotes]);

  // ── Video started ─────────────────────────────────────────────────────
  const handleVideoStarted = useCallback(() => {
    setVideoStarted(true);
    Log.player('video started');
    // Sound off by default — mute video immediately on start
    videoRef.current?.setVolume(0);
    // Restore saved position if any
    const savedPos = getPosition(lesson.id);
    if (savedPos > 0) {
      videoRef.current?.seekTo(savedPos);
    }
  }, [getPosition, lesson.id]);

  // ── Playback status ───────────────────────────────────────────────────
  // CRITICAL: no isPlaying or playbackSpeed in deps.
  // Use refs instead to avoid stale closures that caused the timer reset bug.
  const handlePlaybackStatus = useCallback(
    (status: { isLoaded: boolean; isPlaying?: boolean; positionMillis?: number; durationMillis?: number }) => {
      if (!status.isLoaded) return;

      const now = Date.now();
      const positionSecs = (status.positionMillis ?? 0) / 1000;

      setCurrentTime(positionSecs);
      currentTimeRef.current = positionSecs;
      if (status.durationMillis) setVideoDuration(status.durationMillis / 1000);

      // Gate engine sync on isPlayingRef — NOT status.isPlaying.
      // YouTube timer always fires isPlaying:true even when paused,
      // so we can't trust it. Our ref is the authoritative source.
      if (now - lastSyncRef.current >= 100) {
        lastSyncRef.current = now;
        if (isPlayingRef.current) {
          engineRef.current?.syncToTime(positionSecs, playbackSpeedRef.current);
        } else {
          engineRef.current?.pause();
        }
      }

      // Auto-save position every 10s
      if (now - lastSaveRef.current >= 10_000) {
        lastSaveRef.current = now;
        savePosition(lesson.id, positionSecs);
      }
    },
    [lesson.id, savePosition]
  );

  // ── Toggle play/pause ─────────────────────────────────────────────────
  // CRITICAL: empty deps — reads isPlayingRef not state.
  // If isPlaying state were in deps, every play/pause would recreate this
  // function → change onTogglePlay prop → VideoPlayer re-renders →
  // useImperativeHandle recreates → ytTimerRef is lost.
  const togglePlay = useCallback(() => {
    if (isPlayingRef.current) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      videoRef.current?.pause();
      engineRef.current?.pause();
    } else {
      isPlayingRef.current = true;
      setIsPlaying(true);
      videoRef.current?.play();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — uses ref

  // ── Save notation ─────────────────────────────────────────────────────
  const handleNotesEdit = useCallback(
    async (updatedNotes: Note[]) => {
      setLocalNotes(updatedNotes);
      engineRef.current?.load(updatedNotes, HARMONIUM_SAMPLE_MAP);
      try {
        await api.put(`/api/tutor/lessons/${lesson.id}/notation/direct`, { notes: updatedNotes });
        Log.player('notation saved');
      } catch (err) {
        Log.apiError('notation save failed', err);
      }
    },
    [lesson.id]
  );

  // ── Derived ───────────────────────────────────────────────────────────
  const speedLabel = playbackSpeed.toFixed(2).replace(/\.?0+$/, '') + 'x';

  const videoSource = useMemo(
    () => (lesson.video_url ? { uri: lesson.video_url } : MOCK_VIDEO_URL),
    [lesson.video_url]
  );

  // ── Shared VideoPlayer props ──────────────────────────────────────────
  // togglePlay has stable identity (empty deps useCallback) so it won't
  // cause VideoPlayer re-renders or useImperativeHandle recreation.
  const videoPlayerProps = {
    source: videoSource,
    thumbnailUrl: lesson.thumbnail_url ?? undefined,
    started: videoStarted,
    onStarted: handleVideoStarted,
    onPlaybackStatus: handlePlaybackStatus,
    isPlaying,
    onTogglePlay: togglePlay,
    currentTimeSeconds: currentTime,
    durationSeconds: videoDuration,
    onSeek: (s: number) => videoRef.current?.seekTo(s),
  };

  // ── Header ────────────────────────────────────────────────────────────
  const header = (
    <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
      <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.surface }]}>
        <Ionicons name="chevron-back" size={20} color={theme.textPrimary} />
      </TouchableOpacity>
      <Text numberOfLines={1} style={[styles.headerTitle, { color: theme.textPrimary }]}>
        {lesson.title}
      </Text>
      <TouchableOpacity onPress={() => markComplete(lesson.id)} style={styles.completeBtn}>
        <Ionicons
          name={isComplete(lesson.id) ? 'checkmark-circle' : 'checkmark-circle-outline'}
          size={24}
          color={isComplete(lesson.id) ? theme.success : theme.textDisabled}
        />
      </TouchableOpacity>
    </View>
  );

  // ── Speed + sound controls ────────────────────────────────────────────
  const speedSlider = (
    <View>
      <Text style={[styles.timeDisplay, { color: theme.textSecondary }]}>
        {formatTimeMs(currentTime)}
      </Text>
      <View style={styles.sliderRow}>
        <Text style={styles.sliderEmoji}>🐢</Text>
        <Slider
          style={styles.slider}
          minimumValue={0.25}
          maximumValue={2.0}
          step={0.05}
          value={playbackSpeed}
          onValueChange={(v) => {
            setPlaybackSpeed(v);
            videoRef.current?.setRate(v);
          }}
          minimumTrackTintColor={theme.primary}
          maximumTrackTintColor={theme.border}
          thumbTintColor={theme.textPrimary}
        />
        <Text style={styles.sliderEmoji}>🐇</Text>
        <Text style={[styles.speedLabel, { color: theme.textSecondary }]}>{speedLabel}</Text>
        <TouchableOpacity
          onPress={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            engineRef.current?.setSoundEnabled(next);
            videoRef.current?.setVolume(next ? 1 : 0);
          }}
          style={[styles.soundBtn, {
            backgroundColor: soundEnabled ? theme.primary : theme.surface,
            borderColor: theme.border,
          }]}
        >
          <Ionicons
            name={soundEnabled ? 'musical-notes' : 'musical-notes-outline'}
            size={18}
            color={soundEnabled ? theme.textOnPrimary : theme.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── Edit toolbar (tutor only) ─────────────────────────────────────────
  const editToolbar = isTutor ? (
    <View style={[styles.editToolbar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <TouchableOpacity
        onPress={() => setEditMode(!editMode)}
        style={[styles.editModeBtn, { backgroundColor: editMode ? theme.primary : theme.surface, borderColor: theme.border }]}
      >
        <Text style={{ color: editMode ? theme.textOnPrimary : theme.textSecondary, fontSize: FontSize.sm, fontWeight: '600' }}>
          {editMode ? '✏️ Editing' : '✏️ Edit'}
        </Text>
      </TouchableOpacity>
      {editMode && (
        <>
          <Text style={{ color: theme.textSecondary, fontSize: FontSize.sm }}>BPM:</Text>
          <TextInput
            style={[styles.bpmInput, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.background }]}
            value={String(bpm)}
            onChangeText={(t) => { const n = parseInt(t, 10); if (!isNaN(n) && n > 0) setBpm(n); }}
            keyboardType="number-pad"
          />
          <TouchableOpacity
            onPress={() => setSnapToBeat(!snapToBeat)}
            style={[styles.snapBtn, { backgroundColor: snapToBeat ? theme.primary : theme.surface, borderColor: theme.border }]}
          >
            <Text style={{ color: snapToBeat ? theme.textOnPrimary : theme.textSecondary, fontSize: FontSize.xs, fontWeight: '600' }}>
              {snapToBeat ? '⊙ Snap ON' : '⊙ Snap OFF'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFirstBeat(currentTimeRef.current)}
            style={[styles.snapBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <Text style={{ color: theme.textSecondary, fontSize: FontSize.xs }}>Set Beat 1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => { await handleNotesEdit(localNotes); setEditMode(false); }}
            style={[styles.saveNotationBtn, { backgroundColor: theme.success }]}
          >
            <Text style={{ color: theme.textOnPrimary, fontWeight: '700', fontSize: FontSize.sm }}>Save ✓</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  ) : null;

  // ── Notation ──────────────────────────────────────────────────────────
  const notationPanel = (
    <NotationContainer
      engineRef={engineRef}
      notes={localNotes}
      isTutor={isTutor ?? false}
      onNotesEdit={setLocalNotes}
      isLandscape={showSideBySide}
      editMode={editMode}
      snapToBeat={snapToBeat}
      bpm={bpm}
      firstBeat={firstBeat}
      currentTimeRef={currentTimeRef}
      videoDuration={videoDuration}
      videoRef={videoRef}
      onRowEditOpen={(idx) => setEditingRowIndex(idx)}
    />
  );

  const rowEditorPanel =
    editingRowIndex !== null ? (
      <RowTimingEditor
        lessonId={lesson.id}
        rowIndex={editingRowIndex}
        rowNotes={getRowNotes(localNotes, editingRowIndex)}
        allNotes={localNotes}
        videoDuration={videoDuration}
        currentVideoTime={currentTime}
        totalRows={Math.ceil(localNotes.length / 8)}
        videoRef={videoRef}
        onSave={(updatedRowNotes) => {
          const allNotes = [...localNotes];
          const start = editingRowIndex * 8;
          updatedRowNotes.forEach((n, i) => { allNotes[start + i] = n; });
          handleNotesEdit(allNotes);
          setEditingRowIndex(null);
        }}
        onSaveAll={(updatedAllNotes) => { handleNotesEdit(updatedAllNotes); }}
        onClose={() => setEditingRowIndex(null)}
        onPrevRow={() => setEditingRowIndex(Math.max(0, editingRowIndex - 1))}
        onNextRow={() => setEditingRowIndex(Math.min(Math.ceil(localNotes.length / 8) - 1, editingRowIndex + 1))}
      />
    ) : notationPanel;

  // ── Layouts ───────────────────────────────────────────────────────────
  if (showSideBySide) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {header}
        <View style={styles.sideBySideVideo}>
          <VideoPlayer ref={videoRef} {...videoPlayerProps} isLandscape />
        </View>
        <View style={[styles.verticalDivider, { backgroundColor: theme.divider }]} />
        <View style={styles.sideBySideNotation}>
          {editingRowIndex === null && speedSlider}
          {editingRowIndex === null && editToolbar}
          {rowEditorPanel}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {header}
      <VideoPlayer ref={videoRef} {...videoPlayerProps} isLandscape={false} />
      <View style={[styles.horizontalDivider, { backgroundColor: theme.divider }]} />
      {editingRowIndex === null && speedSlider}
      {editingRowIndex === null && editToolbar}
      {rowEditorPanel}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 0.5,
  },
  backBtn: { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: FontSize.md, fontWeight: '600' },
  completeBtn: { padding: Spacing.xs },
  horizontalDivider: { width: '100%', height: Spacing.sm - 2 },
  verticalDivider: { width: Spacing.sm - 2, alignSelf: 'stretch' },
  sideBySideVideo: { flex: 1 },
  sideBySideNotation: { flex: 1 },
  timeDisplay: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: Spacing.xs,
    fontVariant: ['tabular-nums'],
  },
  editToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 0.5,
    flexWrap: 'wrap',
  },
  editModeBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md, borderWidth: 1 },
  bpmInput: { width: 52, height: 32, borderRadius: Radius.sm, borderWidth: 1, textAlign: 'center', fontSize: FontSize.sm, fontWeight: '600' },
  snapBtn: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm, borderRadius: Radius.md, borderWidth: 1 },
  saveNotationBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md, marginLeft: 'auto' },
  sliderRow: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  sliderEmoji: { fontSize: 16 },
  slider: { flex: 1 },
  speedLabel: { fontSize: FontSize.sm, fontWeight: '600', minWidth: 36, textAlign: 'right' },
  soundBtn: { width: 36, height: 36, borderRadius: Radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});