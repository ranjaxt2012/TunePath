import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme, FontSize } from '@/src/design';
import type { Note } from '@/src/hooks/useLesson';

interface RowTimingEditorProps {
  visible: boolean;
  rowIndex: number;
  rowNotes: Note[];
  videoDuration: number;
  onSave(updatedNotes: Note[]): void;
  onClose(): void;
  onPrevRow(): void;
  onNextRow(): void;
  totalRows: number;
  videoRef: React.RefObject<any>;
}

export function RowTimingEditor({
  visible,
  rowIndex,
  rowNotes,
  videoDuration,
  onSave,
  onClose,
  onPrevRow,
  onNextRow,
  totalRows,
  videoRef,
}: RowTimingEditorProps) {
  const { theme } = useTheme();
  const [editingNotes, setEditingNotes] = useState<Note[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [zoom, setZoom] = useState<1 | 2 | 4>(1);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setEditingNotes([...rowNotes]);
    setSelectedIdx(0);
    setZoom(1);
    setIsPreviewing(false);
  }, [rowNotes]);

  useEffect(() => {
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, []);

  const currentNote = editingNotes[selectedIdx];
  const currentEnd = currentNote ? currentNote.time + currentNote.duration : 0;

  const safeDuration = videoDuration > 0 ? videoDuration : 300;

  const updateNote = (idx: number, changes: Partial<Note>) => {
    const updated = [...editingNotes];
    updated[idx] = { ...updated[idx], ...changes };
    setEditingNotes(updated);
  };

  const zoomWindow = useMemo(() => {
    if (zoom === 1) return { start: 0, end: safeDuration };
    const center = currentNote ? currentNote.time + currentNote.duration / 2 : 0;
    const half = zoom === 2 ? 3 : 1.5;
    return {
      start: Math.max(0, center - half),
      end: Math.min(safeDuration, center + half),
    };
  }, [zoom, selectedIdx, currentNote, safeDuration]);

  const timeToPercent = (t: number) => {
    const range = zoomWindow.end - zoomWindow.start;
    if (range <= 0) return 0;
    return ((t - zoomWindow.start) / range) * 100;
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: theme.modalBg }]}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: theme.border }]} />

          {/* Title bar */}
          <View style={styles.titleBar}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              Row {rowIndex + 1} — {rowNotes.length} notes
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: theme.textSecondary, fontSize: 20 }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* NOTE CHIPS */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipsScroll}
              contentContainerStyle={styles.chips}
            >
              {editingNotes.map((note, idx) => {
                const isDone = note.time > 0 || note.duration > 0;
                const isSelected = idx === selectedIdx;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setSelectedIdx(idx)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected
                          ? theme.primary + '30'
                          : isDone
                          ? '#10B98120'
                          : theme.surface,
                        borderColor: isSelected
                          ? theme.primary
                          : isDone
                          ? '#10B981'
                          : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: FontSize.xs,
                        fontWeight: '700',
                        color: isSelected
                          ? theme.primary
                          : isDone
                          ? '#10B981'
                          : theme.textDisabled,
                      }}
                    >
                      {note.note}
                      {isDone ? ' ✓' : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* ZOOM CONTROLS */}
            <View style={styles.zoomRow}>
              <Text style={[styles.zoomLabel, { color: theme.textDisabled }]}>ZOOM</Text>
              <Text style={[styles.zoomCur, { color: theme.primary }]}>{zoom}x</Text>
              {([1, 2, 4] as const).map((z) => (
                <TouchableOpacity
                  key={z}
                  onPress={() => setZoom(z)}
                  style={[
                    styles.zoomBtn,
                    {
                      backgroundColor: zoom === z ? theme.primary + '30' : theme.surface,
                      borderColor: zoom === z ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: FontSize.xs,
                      fontWeight: '700',
                      color: zoom === z ? theme.primary : theme.textDisabled,
                    }}
                  >
                    {z}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* TIMELINE */}
            <View style={styles.timelineSection}>
              {/* Range labels */}
              <View style={styles.rangeLabels}>
                {[0, 0.25, 0.5, 0.75, 1].map((p) => {
                  const t = zoomWindow.start + p * (zoomWindow.end - zoomWindow.start);
                  return (
                    <Text key={p} style={[styles.rangeLabel, { color: theme.textDisabled }]}>
                      {t.toFixed(2)}s
                    </Text>
                  );
                })}
              </View>

              {/* Track */}
              <View style={[styles.track, { backgroundColor: theme.surface }]}>
                {editingNotes.map((note, idx) => {
                  const isDone = note.time > 0 || note.duration > 0;
                  const isSelected = idx === selectedIdx;
                  const left = timeToPercent(note.time);
                  const width = timeToPercent(note.time + note.duration) - left;
                  if (left < -5 || left > 105) return null;
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSelectedIdx(idx)}
                      style={[
                        styles.segment,
                        {
                          left: `${Math.max(0, left)}%` as any,
                          width: `${Math.max(2, width)}%` as any,
                          backgroundColor: isSelected
                            ? theme.primary + '50'
                            : isDone
                            ? '#10B98130'
                            : theme.surface,
                          borderColor: isSelected
                            ? theme.primary
                            : isDone
                            ? '#10B981'
                            : theme.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 7,
                          fontWeight: '700',
                          color: isSelected
                            ? theme.primary
                            : isDone
                            ? '#10B981'
                            : theme.textDisabled,
                          position: 'absolute',
                          bottom: -14,
                          alignSelf: 'center',
                        }}
                      >
                        {note.note}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Spacing for note labels below track */}
              <View style={{ height: 18 }} />
            </View>

            {/* SLIDERS */}
            {currentNote && (
              <View style={styles.sliderSection}>
                {/* START slider */}
                <View style={styles.sliderRow}>
                  <View style={styles.sliderHeader}>
                    <Text style={[styles.sliderLbl, { color: '#10B981' }]}>▶ Start</Text>
                    <Text style={[styles.sliderVal, { color: '#10B981' }]}>
                      {currentNote.time.toFixed(3)}s
                    </Text>
                  </View>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={safeDuration - 0.1}
                    step={0.001}
                    value={currentNote.time}
                    onValueChange={(v) => {
                      if (v < currentEnd - 0.05) {
                        updateNote(selectedIdx, { time: v, duration: currentEnd - v });
                      }
                    }}
                    minimumTrackTintColor="#10B981"
                    maximumTrackTintColor={theme.border}
                    thumbTintColor="#10B981"
                  />
                </View>

                {/* END slider */}
                <View style={styles.sliderRow}>
                  <View style={styles.sliderHeader}>
                    <Text style={[styles.sliderLbl, { color: '#EF4444' }]}>■ End</Text>
                    <Text style={[styles.sliderVal, { color: '#EF4444' }]}>
                      {currentEnd.toFixed(3)}s
                    </Text>
                  </View>
                  <Slider
                    style={styles.slider}
                    minimumValue={0.1}
                    maximumValue={safeDuration}
                    step={0.001}
                    value={currentEnd}
                    onValueChange={(v) => {
                      if (v > currentNote.time + 0.05) {
                        updateNote(selectedIdx, { duration: v - currentNote.time });
                      }
                    }}
                    minimumTrackTintColor={theme.border}
                    maximumTrackTintColor="#EF4444"
                    thumbTintColor="#EF4444"
                  />
                </View>

                {/* NUDGE BUTTONS — 4x zoom only */}
                {zoom === 4 && (
                  <View
                    style={[
                      styles.nudgeSection,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                    ]}
                  >
                    <View style={styles.nudgeRow}>
                      <Text style={[styles.nudgeLabel, { color: '#10B981' }]}>Start</Text>
                      {([-0.05, -0.01, 0.01, 0.05] as const).map((d) => (
                        <TouchableOpacity
                          key={d}
                          onPress={() => {
                            const newT = Math.max(0, currentNote.time + d);
                            if (newT < currentEnd - 0.05) {
                              updateNote(selectedIdx, { time: newT, duration: currentEnd - newT });
                            }
                          }}
                          style={[
                            styles.nudgeBtn,
                            { backgroundColor: theme.surface, borderColor: theme.border },
                          ]}
                        >
                          <Text
                            style={{
                              fontSize: 9,
                              color: theme.textSecondary,
                              fontFamily: 'monospace',
                            }}
                          >
                            {d > 0 ? '+' : ''}
                            {(d * 1000).toFixed(0)}ms
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
                            if (newEnd > currentNote.time + 0.05) {
                              updateNote(selectedIdx, { duration: newEnd - currentNote.time });
                            }
                          }}
                          style={[
                            styles.nudgeBtn,
                            { backgroundColor: theme.surface, borderColor: theme.border },
                          ]}
                        >
                          <Text
                            style={{
                              fontSize: 9,
                              color: theme.textSecondary,
                              fontFamily: 'monospace',
                            }}
                          >
                            {d > 0 ? '+' : ''}
                            {(d * 1000).toFixed(0)}ms
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Duration info row */}
                <View style={styles.durationRow}>
                  <View style={styles.durItem}>
                    <Text style={[styles.durLabel, { color: theme.textDisabled }]}>Start</Text>
                    <Text style={{ color: '#10B981', fontSize: FontSize.sm, fontWeight: '700' }}>
                      {currentNote.time.toFixed(3)}s
                    </Text>
                  </View>
                  <Text style={{ color: theme.textDisabled, fontSize: 18 }}>→</Text>
                  <View
                    style={[
                      styles.durPill,
                      {
                        backgroundColor: theme.primary + '20',
                        borderColor: theme.primary + '50',
                      },
                    ]}
                  >
                    <Text
                      style={{ color: theme.primary, fontSize: FontSize.xs, fontWeight: '700' }}
                    >
                      {(currentEnd - currentNote.time).toFixed(3)}s
                    </Text>
                  </View>
                  <Text style={{ color: theme.textDisabled, fontSize: 18 }}>→</Text>
                  <View style={styles.durItem}>
                    <Text style={[styles.durLabel, { color: theme.textDisabled }]}>End</Text>
                    <Text style={{ color: '#EF4444', fontSize: FontSize.sm, fontWeight: '700' }}>
                      {currentEnd.toFixed(3)}s
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* PREVIEW BANNER */}
            {isPreviewing && (
              <View
                style={[
                  styles.previewBanner,
                  {
                    backgroundColor: 'rgba(245,158,11,0.08)',
                    borderColor: 'rgba(245,158,11,0.2)',
                  },
                ]}
              >
                <View style={styles.previewDot} />
                <Text
                  style={{
                    color: '#F59E0B',
                    fontSize: FontSize.sm,
                    fontWeight: '600',
                    flex: 1,
                  }}
                >
                  Playing {currentNote?.time.toFixed(3)}s → {currentEnd.toFixed(3)}s
                </Text>
                <TouchableOpacity onPress={() => setIsPreviewing(false)}>
                  <Text style={{ color: 'rgba(245,158,11,0.6)', fontSize: FontSize.sm }}>
                    ■ Stop
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ACTION BUTTONS */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[
                  styles.btnPreview,
                  {
                    backgroundColor: isPreviewing
                      ? 'rgba(245,158,11,0.2)'
                      : 'rgba(245,158,11,0.1)',
                    borderColor: isPreviewing ? '#F59E0B' : 'rgba(245,158,11,0.3)',
                  },
                ]}
                onPress={() => {
                  if (isPreviewing) {
                    setIsPreviewing(false);
                    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
                    return;
                  }
                  if (!currentNote) return;
                  setIsPreviewing(true);
                  if (videoRef?.current) {
                    try {
                      videoRef.current.seekTo?.(currentNote.time);
                    } catch {}
                  }
                  previewTimerRef.current = setTimeout(() => {
                    setIsPreviewing(false);
                  }, currentNote.duration * 1000 + 200);
                }}
              >
                <Text style={{ color: '#F59E0B', fontSize: FontSize.sm, fontWeight: '600' }}>
                  {isPreviewing ? '■ Stop' : '▶ Preview'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnSave, { backgroundColor: theme.primary }]}
                onPress={() => {
                  if (selectedIdx < editingNotes.length - 1) {
                    setSelectedIdx(selectedIdx + 1);
                  }
                }}
              >
                <Text
                  style={{
                    color: theme.textOnPrimary,
                    fontSize: FontSize.md,
                    fontWeight: '700',
                  }}
                >
                  {selectedIdx < editingNotes.length - 1 ? 'Save & Next →' : 'Save Note ✓'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* SAVE ROW BUTTON — shown when all notes timed */}
            {editingNotes.length > 0 &&
              editingNotes.every((n) => n.time > 0 || n.duration > 0) && (
                <TouchableOpacity
                  style={[styles.btnSaveRow, { backgroundColor: '#10B981' }]}
                  onPress={() => onSave(editingNotes)}
                >
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: FontSize.md,
                      fontWeight: '700',
                      textAlign: 'center',
                    }}
                  >
                    Save Row {rowIndex + 1} to Cloud ↑
                  </Text>
                </TouchableOpacity>
              )}

            {/* Prev / Next row navigation */}
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
                Row {rowIndex + 1} of {totalRows}
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 32, maxHeight: '92%' },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginVertical: 10 },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  title: { flex: 1, fontSize: 14, fontWeight: '700' },
  chipsScroll: { maxHeight: 44 },
  chips: {
    paddingHorizontal: 16,
    gap: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1.5 },
  zoomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 6,
  },
  zoomLabel: { fontSize: 10, letterSpacing: 0.5, fontWeight: '600' },
  zoomCur: { fontSize: 12, fontWeight: '700', marginRight: 4 },
  zoomBtn: {
    width: 32,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineSection: { paddingHorizontal: 16, paddingBottom: 4 },
  rangeLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  rangeLabel: { fontSize: 9, fontFamily: 'monospace' },
  track: {
    height: 32,
    borderRadius: 8,
    position: 'relative',
    overflow: 'visible' as any,
  },
  segment: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    borderRadius: 4,
    borderWidth: 1.5,
    minWidth: 4,
  },
  sliderSection: { paddingHorizontal: 16, paddingBottom: 4 },
  sliderRow: { marginBottom: 8 },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  sliderLbl: { fontSize: 11, fontWeight: '600' },
  sliderVal: { fontSize: 12, fontWeight: '700', fontFamily: 'monospace' },
  slider: { width: '100%', height: 32 },
  nudgeSection: { marginBottom: 8, padding: 10, borderRadius: 10, borderWidth: 1 },
  nudgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  nudgeLabel: { fontSize: 10, fontWeight: '600', width: 32 },
  nudgeBtn: { paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  durItem: { alignItems: 'center' },
  durLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  durPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  previewBanner: {
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  previewDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F59E0B' },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  btnPreview: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  btnSave: { flex: 2, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  btnSaveRow: {
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  rowNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
});
