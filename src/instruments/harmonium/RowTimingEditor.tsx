import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme, FontSize, Spacing, Radius } from '@/src/design';
import { api } from '@/src/services/api';
import type { Note } from '@/src/hooks/useLesson';

const SPEED_STEPS = [0.25, 0.5, 0.75, 1.0] as const;
type SpeedStep = (typeof SPEED_STEPS)[number];
const SLIDER_WINDOW = 5;

// ── Confidence color coding ───────────────────────────────────────────────────
// green ≥ 0.85 | orange 0.6–0.85 | red < 0.6 | grey = untimed
function confidenceColor(note: Note): string {
  const timed = note.time > 0 || note.duration > 0;
  if (!timed) return '#9CA3AF';
  const c = note.confidence ?? 1.0;
  if (c >= 0.85) return '#10B981';
  if (c >= 0.60) return '#F59E0B';
  return '#EF4444';
}

function confidenceLabel(note: Note): string {
  const timed = note.time > 0 || note.duration > 0;
  if (!timed) return '';
  const c = note.confidence ?? 1.0;
  if (c >= 0.85) return '✓';
  if (c >= 0.60) return '~';
  return '!';
}

interface RowTimingEditorProps {
  lessonId: string;
  rowIndex: number;
  rowNotes: Note[];
  allNotes: Note[];
  videoDuration: number;
  currentVideoTime: number;
  onSave(updatedRowNotes: Note[]): void;
  onSaveAll(updatedAllNotes: Note[]): void;
  onClose(): void;
  onPrevRow(): void;
  onNextRow(): void;
  totalRows: number;
  videoRef: React.RefObject<any>;
}

export function RowTimingEditor({
  lessonId,
  rowIndex,
  rowNotes,
  allNotes,
  videoDuration,
  currentVideoTime,
  onSave,
  onSaveAll,
  onClose,
  onPrevRow,
  onNextRow,
  totalRows,
  videoRef,
}: RowTimingEditorProps) {
  const { theme } = useTheme();
  const [editingNotes, setEditingNotes] = useState<Note[]>([...rowNotes]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [speed, setSpeed] = useState<SpeedStep>(0.5);
  const [pausedByCapture, setPausedByCapture] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [aiSyncing, setAiSyncing] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevRowIndexRef = useRef(rowIndex);

  // ── Reset only when row index changes, not on every render ───────────────
  // Fix: rowNotes is a new array ref every render (getRowNotes in parent),
  // so we key on rowIndex (a stable number) instead.
  useEffect(() => {
    if (prevRowIndexRef.current !== rowIndex) {
      prevRowIndexRef.current = rowIndex;
      setEditingNotes([...rowNotes]);
      setSelectedIdx(0);
      setPausedByCapture(false);
      setIsPreviewing(false);
      setAiMessage(null);
      setAiError(null);
    }
  }, [rowIndex, rowNotes]);

  useEffect(() => {
    try { videoRef?.current?.setRate?.(speed); } catch {}
  }, [speed, videoRef]);

  useEffect(() => {
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      try { videoRef?.current?.setRate?.(1.0); } catch {}
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────
  const currentNote = editingNotes[selectedIdx];
  const currentEnd = currentNote ? currentNote.time + currentNote.duration : 0;
  const allTimed = editingNotes.length > 0 &&
    editingNotes.every((n) => n.time > 0 || n.duration > 0);
  const safeDuration = videoDuration > 0 ? videoDuration : 300;
  const sliderCenter = currentNote
    ? currentNote.time + currentNote.duration / 2
    : currentVideoTime;
  const sliderMin = Math.max(0, sliderCenter - SLIDER_WINDOW);
  const sliderMax = Math.min(safeDuration, sliderCenter + SLIDER_WINDOW);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const updateNote = (idx: number, changes: Partial<Note>) => {
    setEditingNotes((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], ...changes };
      return updated;
    });
  };

  const handleCaptureStart = () => {
    try { videoRef?.current?.pause?.(); } catch {}
    setPausedByCapture(true);
    const t = currentVideoTime;
    const existingEnd = currentNote
      ? currentNote.time + currentNote.duration : t + 1.0;
    const newEnd = t + 0.05 >= existingEnd ? t + 1.0 : existingEnd;
    // confidence=1.0 marks this as tutor-confirmed — AI won't overwrite it
    updateNote(selectedIdx, { time: t, duration: newEnd - t, confidence: 1.0 });
  };

  const handleCaptureEnd = () => {
    if (!currentNote) return;
    try { videoRef?.current?.pause?.(); } catch {}
    setPausedByCapture(true);
    const t = currentVideoTime;
    if (t > currentNote.time + 0.05)
      updateNote(selectedIdx, { duration: t - currentNote.time, confidence: 1.0 });
  };

  const handleResume = () => {
    try {
      videoRef?.current?.setRate?.(speed);
      videoRef?.current?.play?.();
    } catch {}
    setPausedByCapture(false);
  };

  // ── AI Sync ───────────────────────────────────────────────────────────────
  // Sends all note names to the AI endpoint, gets back timed notes for the
  // whole lesson. Notes the tutor manually confirmed (confidence=1.0) are
  // preserved — AI only fills in the untouched ones.
  const handleAiSync = async () => {
    setAiSyncing(true);
    setAiMessage(null);
    setAiError(null);
    try {
      const notation = allNotes.map((n) => n.note).join(' ');
      const result = await api.post(
        `/api/tutor/lessons/${lessonId}/ai-sync`,
        { notation, shruti: 'C' }
      ) as { notes: Note[]; message: string; low_confidence_count: number };

      // Merge: keep tutor-confirmed notes (confidence=1.0), fill rest with AI
      const merged = allNotes.map((existing, i) => {
        const aiNote = result.notes[i];
        if (!aiNote) return existing;
        const tutorConfirmed =
          (existing.confidence ?? 0) >= 1.0 &&
          (existing.time > 0 || existing.duration > 0);
        if (tutorConfirmed) return existing;
        return {
          ...existing,
          time: aiNote.time,
          duration: aiNote.duration,
          octave: aiNote.octave,
          confidence: aiNote.confidence,
        };
      });

      onSaveAll(merged);
      setAiMessage(result.message);

      // Refresh this row from merged result
      const start = rowIndex * 8;
      setEditingNotes(merged.slice(start, start + 8));
    } catch (err: any) {
      setAiError(err?.message ?? 'AI sync failed — try again');
    } finally {
      setAiSyncing(false);
    }
  };

  // ── Live progress ─────────────────────────────────────────────────────────
  const getNoteProgress = (note: Note): number => {
    if (note.time <= 0 && note.duration <= 0) return 0;
    const end = note.time + note.duration;
    if (currentVideoTime <= note.time) return 0;
    if (currentVideoTime >= end) return 1;
    return (currentVideoTime - note.time) / note.duration;
  };

  return (
    <View style={[styles.sheet, { backgroundColor: theme.modalBg }]}>
      <View style={[styles.handle, { backgroundColor: theme.border }]} />

      {/* ── TOP BAR ───────────────────────────────────────────────────────── */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <View style={styles.speedGroup}>
          {SPEED_STEPS.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setSpeed(s)}
              style={[styles.speedChip, {
                backgroundColor: speed === s ? theme.primary + '25' : theme.surface,
                borderColor: speed === s ? theme.primary : theme.border,
              }]}
            >
              <Text style={{
                fontSize: FontSize.xs,
                fontWeight: '700',
                color: speed === s ? theme.primary : theme.textDisabled,
              }}>
                {s}x
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.rowTitle, { color: theme.textSecondary }]}>
          Row {rowIndex + 1}/{totalRows}
        </Text>

        <View style={styles.iconGroup}>
          <TouchableOpacity
            style={[styles.iconBtn, {
              backgroundColor: isPreviewing ? 'rgba(245,158,11,0.2)' : theme.surface,
              borderColor: isPreviewing ? '#F59E0B' : theme.border,
            }]}
            onPress={() => {
              if (isPreviewing) {
                setIsPreviewing(false);
                if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
                return;
              }
              if (!currentNote) return;
              setIsPreviewing(true);
              try { videoRef?.current?.seekTo?.(currentNote.time); } catch {}
              previewTimerRef.current = setTimeout(
                () => setIsPreviewing(false),
                currentNote.duration * 1000 + 300
              );
            }}
          >
            <Text style={{ fontSize: 13, color: '#F59E0B' }}>
              {isPreviewing ? '■' : '▶'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]}
            onPress={() => {
              if (selectedIdx < editingNotes.length - 1)
                setSelectedIdx(selectedIdx + 1);
            }}
          >
            <Text style={{ fontSize: 13, color: theme.textOnPrimary }}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={onClose}
          >
            <Text style={{ fontSize: 13, color: theme.textSecondary }}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── AI SYNC ───────────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={[styles.aiSyncBtn, {
          backgroundColor: aiSyncing ? theme.surface : theme.primary + '12',
          borderColor: theme.primary,
          opacity: aiSyncing ? 0.7 : 1,
        }]}
        onPress={handleAiSync}
        disabled={aiSyncing}
      >
        {aiSyncing
          ? <ActivityIndicator size="small" color={theme.primary} />
          : <Text style={{ fontSize: 15 }}>✨</Text>
        }
        <Text style={{ fontSize: FontSize.sm, fontWeight: '700', color: theme.primary }}>
          {aiSyncing ? 'AI is timing notes…' : 'AI Sync — auto-time all notes'}
        </Text>
      </TouchableOpacity>

      {aiMessage !== null && (
        <View style={[styles.aiBanner, { backgroundColor: '#10B98112', borderColor: '#10B981' }]}>
          <Text style={{ fontSize: FontSize.xs, color: '#10B981', fontWeight: '600' }}>
            {aiMessage}
          </Text>
        </View>
      )}
      {aiError !== null && (
        <View style={[styles.aiBanner, { backgroundColor: '#EF444412', borderColor: '#EF4444' }]}>
          <Text style={{ fontSize: FontSize.xs, color: '#EF4444', fontWeight: '600' }}>
            {aiError}
          </Text>
        </View>
      )}

      {/* ── CAPTURE BUTTONS ───────────────────────────────────────────────── */}
      <View style={styles.captureRow}>
        <TouchableOpacity
          style={[styles.captureBtn, { backgroundColor: '#10B98112', borderColor: '#10B981' }]}
          onPress={handleCaptureStart}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: FontSize.sm, fontWeight: '700', color: '#10B981' }}>
            ▶ Set Start
          </Text>
          <Text style={{ fontSize: FontSize.xs, color: '#10B981', fontVariant: ['tabular-nums'] }}>
            {currentNote ? currentNote.time.toFixed(3) : '—'}s
          </Text>
        </TouchableOpacity>

        <View style={styles.captureCenter}>
          <View style={[styles.liveTimePill, {
            backgroundColor: theme.surface,
            borderColor: pausedByCapture ? theme.primary : theme.border,
          }]}>
            <Text style={[styles.liveTimeText, { color: theme.textPrimary }]}>
              {currentVideoTime.toFixed(3)}s
            </Text>
          </View>
          {pausedByCapture ? (
            <TouchableOpacity
              style={[styles.resumeBtn, { backgroundColor: theme.primary }]}
              onPress={handleResume}
            >
              <Text style={{ color: theme.textOnPrimary, fontSize: FontSize.xs, fontWeight: '700' }}>
                ▶ Resume
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={{ fontSize: 9, color: theme.textDisabled }}>pauses on tap</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.captureBtn, { backgroundColor: '#EF444412', borderColor: '#EF4444' }]}
          onPress={handleCaptureEnd}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: FontSize.sm, fontWeight: '700', color: '#EF4444' }}>
            ■ Set End
          </Text>
          <Text style={{ fontSize: FontSize.xs, color: '#EF4444', fontVariant: ['tabular-nums'] }}>
            {currentNote ? currentEnd.toFixed(3) : '—'}s
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── NOTE CHIPS ────────────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chips}
        >
          {editingNotes.map((note, idx) => {
            const isSelected = idx === selectedIdx;
            const color = confidenceColor(note);
            const label = confidenceLabel(note);
            const progress = getNoteProgress(note);
            const isActive = progress > 0 && progress < 1;
            const timed = note.time > 0 || note.duration > 0;

            return (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedIdx(idx)}
                style={[styles.chip, {
                  backgroundColor: isSelected ? color + '30' : timed ? color + '15' : theme.surface,
                  borderColor: isSelected ? color : timed ? color + '80' : theme.border,
                  borderWidth: isSelected ? 2 : 1.5,
                }]}
              >
                <Text style={{
                  fontSize: FontSize.xs,
                  fontWeight: '700',
                  color: isSelected ? color : timed ? color : theme.textDisabled,
                }}>
                  {note.note}
                </Text>
                {label !== '' && (
                  <Text style={{ fontSize: 8, color, lineHeight: 10 }}>{label}</Text>
                )}
                {timed && (
                  <View style={styles.chipProgressTrack}>
                    <View style={[styles.chipProgressFill, {
                      width: `${Math.min(100, progress * 100)}%` as any,
                      backgroundColor: isActive ? color : color + '50',
                    }]} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Confidence legend */}
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={[styles.legendText, { color: theme.textDisabled }]}>confident</Text>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={[styles.legendText, { color: theme.textDisabled }]}>review</Text>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={[styles.legendText, { color: theme.textDisabled }]}>fix needed</Text>
        </View>

        {/* ── ZOOMED SLIDERS ────────────────────────────────────────────── */}
        {currentNote && (
          <View style={styles.sliderSection}>
            <Text style={[styles.windowLabel, { color: theme.textDisabled }]}>
              ±{SLIDER_WINDOW}s window · {sliderMin.toFixed(1)}s → {sliderMax.toFixed(1)}s
            </Text>

            <View style={styles.sliderRow}>
              <View style={styles.sliderHeader}>
                <Text style={[styles.sliderLbl, { color: '#10B981' }]}>▶ Start</Text>
                <Text style={[styles.sliderVal, { color: '#10B981' }]}>
                  {currentNote.time.toFixed(3)}s
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={sliderMin}
                maximumValue={sliderMax - 0.05}
                step={0.01}
                value={Math.min(Math.max(currentNote.time, sliderMin), sliderMax - 0.05)}
                onValueChange={(v) => {
                  if (v < currentEnd - 0.05)
                    updateNote(selectedIdx, { time: v, duration: currentEnd - v, confidence: 1.0 });
                }}
                minimumTrackTintColor="#10B981"
                maximumTrackTintColor={theme.border}
                thumbTintColor="#10B981"
              />
            </View>

            <View style={styles.sliderRow}>
              <View style={styles.sliderHeader}>
                <Text style={[styles.sliderLbl, { color: '#EF4444' }]}>■ End</Text>
                <Text style={[styles.sliderVal, { color: '#EF4444' }]}>
                  {currentEnd.toFixed(3)}s
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={sliderMin + 0.05}
                maximumValue={sliderMax}
                step={0.01}
                value={Math.min(Math.max(currentEnd, sliderMin + 0.05), sliderMax)}
                onValueChange={(v) => {
                  if (v > currentNote.time + 0.05)
                    updateNote(selectedIdx, { duration: v - currentNote.time, confidence: 1.0 });
                }}
                minimumTrackTintColor={theme.border}
                maximumTrackTintColor="#EF4444"
                thumbTintColor="#EF4444"
              />
            </View>

            {/* Nudge — always visible */}
            <View style={[styles.nudgeSection, {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            }]}>
              <View style={styles.nudgeRow}>
                <Text style={[styles.nudgeLabel, { color: '#10B981' }]}>Start</Text>
                {([-0.05, -0.01, 0.01, 0.05] as const).map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => {
                      const newT = Math.max(0, currentNote.time + d);
                      if (newT < currentEnd - 0.05)
                        updateNote(selectedIdx, { time: newT, duration: currentEnd - newT, confidence: 1.0 });
                    }}
                    style={[styles.nudgeBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  >
                    <Text style={{ fontSize: 9, color: theme.textSecondary, fontFamily: 'monospace' }}>
                      {d > 0 ? '+' : ''}{(d * 1000).toFixed(0)}ms
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.nudgeRow}>
                <Text style={[styles.nudgeLabel, { color: '#EF4444' }]}>End</Text>
                {([-0.05, -0.01, 0.01, 0.05] as const).map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => {
                      const newEnd = Math.min(safeDuration, currentEnd + d);
                      if (newEnd > currentNote.time + 0.05)
                        updateNote(selectedIdx, { duration: newEnd - currentNote.time, confidence: 1.0 });
                    }}
                    style={[styles.nudgeBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  >
                    <Text style={{ fontSize: 9, color: theme.textSecondary, fontFamily: 'monospace' }}>
                      {d > 0 ? '+' : ''}{(d * 1000).toFixed(0)}ms
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ── SAVE ROW ──────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.btnSaveRow, { backgroundColor: '#10B981', opacity: allTimed ? 1 : 0.4 }]}
          onPress={() => { if (allTimed) onSave(editingNotes); }}
        >
          <Text style={{ color: '#fff', fontSize: FontSize.md, fontWeight: '700', textAlign: 'center' }}>
            Save Row {rowIndex + 1} to Cloud ↑
          </Text>
        </TouchableOpacity>

        {/* ── ROW NAV ───────────────────────────────────────────────────── */}
        <View style={styles.rowNavRow}>
          <TouchableOpacity
            onPress={onPrevRow}
            disabled={rowIndex === 0}
            style={{ opacity: rowIndex === 0 ? 0.3 : 1 }}
          >
            <Text style={{ color: theme.textSecondary, fontSize: FontSize.sm }}>
              ◀ Row {rowIndex}
            </Text>
          </TouchableOpacity>
          <Text style={{ color: theme.textDisabled, fontSize: FontSize.xs }}>
            {rowIndex + 1} of {totalRows}
          </Text>
          <TouchableOpacity
            onPress={onNextRow}
            disabled={rowIndex === totalRows - 1}
            style={{ opacity: rowIndex === totalRows - 1 ? 0.3 : 1 }}
          >
            <Text style={{ color: theme.textSecondary, fontSize: FontSize.sm }}>
              Row {rowIndex + 2} ▶
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginVertical: 8 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 0.5,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  speedGroup: { flexDirection: 'row', gap: 4 },
  speedChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    minWidth: 38,
    alignItems: 'center',
  },
  rowTitle: { flex: 1, fontSize: FontSize.xs, textAlign: 'center' },
  iconGroup: { flexDirection: 'row', gap: 4 },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  aiSyncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
  },
  aiBanner: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
  },

  captureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  captureBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 2,
    alignItems: 'center',
    gap: 3,
  },
  captureCenter: { alignItems: 'center', gap: 4 },
  liveTimePill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 1.5,
  },
  liveTimeText: { fontSize: FontSize.sm, fontWeight: '700', fontVariant: ['tabular-nums'] },
  resumeBtn: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.md },

  chipsScroll: { maxHeight: 64 },
  chips: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingBottom: 5,
    borderRadius: Radius.sm,
    minWidth: 42,
    alignItems: 'center',
    overflow: 'hidden',
    gap: 1,
  },
  chipProgressTrack: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3 },
  chipProgressFill: { height: 3, borderRadius: 1.5 },

  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { fontSize: 9, marginRight: Spacing.sm },

  sliderSection: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  windowLabel: { fontSize: 9, fontFamily: 'monospace', textAlign: 'center', marginBottom: Spacing.xs },
  sliderRow: { marginBottom: Spacing.xs },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  sliderLbl: { fontSize: 11, fontWeight: '600' },
  sliderVal: { fontSize: 12, fontWeight: '700', fontFamily: 'monospace' },
  slider: { width: '100%', height: 32 },

  nudgeSection: { marginTop: Spacing.xs, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 1 },
  nudgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  nudgeLabel: { fontSize: 10, fontWeight: '600', width: 32 },
  nudgeBtn: { paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },

  btnSaveRow: {
    marginHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  rowNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: 4,
  },
});