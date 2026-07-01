import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, PanResponder, type DimensionValue } from 'react-native';
import { useTheme, FontSize, Spacing, Radius } from '@/src/design';
import type { Theme } from '@/src/design/themes';
import type { Note } from '@/src/hooks/useLesson';
import type { VideoPlayerHandle } from './VideoPlayer';

// ── Sargam scale ──────────────────────────────────────────────────────────
const SVARA = ['Sa', 'Re', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni'] as const;
// Full 12-tone map so komal/tivra notes get a correct height (not all at Sa).
const CHROMA: Record<string, number> = {
  Sa: 0, re: 1, Re: 2, ga: 3, Ga: 4, Ma: 5, ma: 6, Pa: 7, dha: 8, Dha: 9, ni: 10, Ni: 11,
};
const SPEEDS = [0.25, 0.5, 0.75, 1.0] as const;
const NUDGES = [-0.05, -0.01, 0.01, 0.05] as const;
const LANE_H = 150;
const DEG_STEP = 9;
const CONFIRMED = 1.0;

const degreeOf = (name: string) => CHROMA[name] ?? 0;
const isTimed = (n: Note) => n.time > 0 || n.duration > 0;
const noteEnd = (n: Note) => n.time + n.duration;

function confColor(n: Note, t: Theme): string {
  if (!isTimed(n)) return t.textDisabled;
  const c = n.confidence ?? 1;
  if (c >= 0.85) return t.success;
  if (c >= 0.6) return t.warning;
  return t.error;
}
const needsReview = (n: Note) => !isTimed(n) || (n.confidence ?? 1) < 0.85;

interface Props {
  notes: Note[];
  videoDuration: number;
  currentVideoTime: number;
  isPlaying: boolean;
  keyLabel?: string;
  onTogglePlay(): void;
  videoRef: React.RefObject<VideoPlayerHandle | null>;
  onSave(notes: Note[]): void;
  onClose(): void;
}

export function SargamRollEditor({
  notes, videoDuration, currentVideoTime, isPlaying, keyLabel,
  onTogglePlay, videoRef, onSave, onClose,
}: Props) {
  const { theme } = useTheme();
  // Sanitize on load: notation may lack duration/octave (→ NaN downstream).
  const [work, setWork] = useState<Note[]>(() =>
    notes.map((n, i) => {
      const next = notes[i + 1];
      const dur = Number.isFinite(n.duration) && n.duration > 0
        ? n.duration
        : next && Number.isFinite(next.time) ? Math.max(0.2, next.time - n.time) : 0.6;
      return { ...n, duration: dur, octave: n.octave ?? 0 };
    })
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number>(0.5);
  const [dirty, setDirty] = useState(false);

  // freshest video time for tap capture (prop can lag a frame)
  const timeRef = useRef(currentVideoTime);
  timeRef.current = currentVideoTime;

  // start slow for dictation
  useEffect(() => { try { videoRef.current?.setRate(0.5); } catch { /* noop */ } }, [videoRef]);

  const dur = videoDuration > 0 ? videoDuration : Math.max(noteEnd(work[work.length - 1] ?? { time: 0, duration: 0 } as Note), 30);
  const placedCount = work.filter(isTimed).length;
  const nextNote = work.find((n) => !isTimed(n));
  const pct = (t: number): DimensionValue => `${Math.max(0, Math.min(100, (t / dur) * 100))}%` as DimensionValue;

  const update = (i: number, changes: Partial<Note>) => {
    setWork((prev) => { const u = [...prev]; u[i] = { ...u[i], ...changes }; return u; });
    setDirty(true);
  };

  // ── TAP: assign onset to the next un-timed note, close the previous one ──
  const handleTap = () => {
    const idx = work.findIndex((n) => !isTimed(n));
    if (idx < 0) return;
    const t = timeRef.current;
    setWork((prev) => {
      const u = prev.map((n) => ({ ...n }));
      if (idx > 0) u[idx - 1].duration = Math.max(0.2, t - u[idx - 1].time);
      u[idx].time = t;
      u[idx].duration = 0.6;
      u[idx].confidence = CONFIRMED;
      return u;
    });
    setDirty(true);
    setSelected(idx);
  };

  const handleUndoTap = () => {
    const timed = work.map((n, i) => (isTimed(n) ? i : -1)).filter((i) => i >= 0);
    const last = timed[timed.length - 1];
    if (last === undefined) return;
    update(last, { time: 0, duration: 0, confidence: 0 });
  };

  const handleNextIssue = () => {
    const from = selected ?? -1;
    const timedSorted = [...work.keys()].sort((a, b) => work[a].time - work[b].time);
    const after = timedSorted.filter((i) => work[i].time > (work[from]?.time ?? -1));
    const target = [...after, ...timedSorted].find((i) => needsReview(work[i]));
    if (target === undefined) return;
    setSelected(target);
    try { videoRef.current?.seekTo(Math.max(0, work[target].time - 2)); } catch { /* noop */ }
  };

  const retune = (name: string) => {
    if (selected === null) return;
    update(selected, { note: name, confidence: CONFIRMED });
  };

  // ── Fine timing edit of the selected note (drag-less nudge) ─────────────
  const nudge = (field: 'start' | 'end', delta: number) => {
    if (selected === null) return;
    const n = work[selected];
    if (field === 'start') {
      const t = Math.max(0, Math.min(n.time + delta, noteEnd(n) - 0.05));
      update(selected, { time: t, duration: noteEnd(n) - t, confidence: CONFIRMED });
    } else {
      const e = Math.max(n.time + 0.05, Math.min(noteEnd(n) + delta, dur));
      update(selected, { duration: e - n.time, confidence: CONFIRMED });
    }
  };
  const setFromPlayhead = (field: 'start' | 'end') => {
    if (selected === null) return;
    const n = work[selected];
    const t = currentVideoTime;
    if (field === 'start' && t < noteEnd(n) - 0.05) update(selected, { time: t, duration: noteEnd(n) - t, confidence: CONFIRMED });
    if (field === 'end' && t > n.time + 0.05) update(selected, { duration: t - n.time, confidence: CONFIRMED });
  };

  // ── Drag the chip edges to set start/end directly on the timeline ────────
  // Refs keep the PanResponder (created once) free of stale closures.
  const selectedRef = useRef(selected); selectedRef.current = selected;
  const workRef = useRef(work); workRef.current = work;
  const durRef = useRef(dur); durRef.current = dur;
  const laneWidthRef = useRef(1);
  const dragBaseRef = useRef({ time: 0, end: 0 });

  const makeEdgeHandle = (field: 'start' | 'end') => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      const idx = selectedRef.current;
      if (idx === null) return;
      const n = workRef.current[idx];
      dragBaseRef.current = { time: n.time, end: n.time + n.duration };
    },
    onPanResponderMove: (_e, g) => {
      const idx = selectedRef.current;
      if (idx === null) return;
      const dt = (g.dx / Math.max(1, laneWidthRef.current)) * durRef.current;
      const base = dragBaseRef.current;
      if (field === 'start') {
        const t = Math.max(0, Math.min(base.time + dt, base.end - 0.05));
        update(idx, { time: t, duration: base.end - t, confidence: CONFIRMED });
      } else {
        const e = Math.max(base.time + 0.05, Math.min(base.end + dt, durRef.current));
        update(idx, { duration: e - base.time, confidence: CONFIRMED });
      }
    },
  });
  const startPanRef = useRef<ReturnType<typeof PanResponder.create> | null>(null);
  const endPanRef = useRef<ReturnType<typeof PanResponder.create> | null>(null);
  if (!startPanRef.current) startPanRef.current = makeEdgeHandle('start');
  if (!endPanRef.current) endPanRef.current = makeEdgeHandle('end');
  const toggleOctave = () => {
    if (selected === null) return;
    const cur = work[selected].octave;
    update(selected, { octave: cur >= 1 ? -1 : cur + 1, confidence: CONFIRMED });
  };

  // ── Lyric spans (consecutive notes sharing a lyric = one word, melisma) ──
  const lyricSpans = useMemo(() => {
    const spans: { text: string; start: number; end: number }[] = [];
    for (const n of work) {
      if (!n.lyric || !isTimed(n)) continue;
      const last = spans[spans.length - 1];
      if (last && last.text === n.lyric) last.end = noteEnd(n);
      else spans.push({ text: n.lyric, start: n.time, end: noteEnd(n) });
    }
    return spans;
  }, [work]);
  const hasLyrics = lyricSpans.length > 0;

  const sel = selected !== null ? work[selected] : null;

  return (
    <View style={[styles.sheet, { backgroundColor: theme.modalBg }]}>
      <View style={[styles.handle, { backgroundColor: theme.border }]} />

      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onTogglePlay} style={[styles.playBtn, { backgroundColor: theme.primary }]}>
          <Text style={{ color: theme.textOnPrimary, fontSize: FontSize.md }}>{isPlaying ? '❚❚' : '▶'}</Text>
        </TouchableOpacity>
        <View style={styles.speedGroup}>
          {SPEEDS.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => { setSpeed(s); try { videoRef.current?.setRate(s); } catch { /* noop */ } }}
              style={[styles.speedChip, {
                backgroundColor: speed === s ? theme.primary + '22' : theme.surface,
                borderColor: speed === s ? theme.primary : theme.border,
              }]}
            >
              <Text style={{ fontSize: FontSize.xs, fontWeight: '700', color: speed === s ? theme.primary : theme.textDisabled }}>{s}x</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={() => { onSave(work); setDirty(false); }}
          disabled={!dirty}
          style={[styles.saveBtn, { backgroundColor: dirty ? theme.success : theme.surface, opacity: dirty ? 1 : 0.5 }]}
        >
          <Text style={{ color: dirty ? theme.textOnPrimary : theme.textDisabled, fontSize: FontSize.sm, fontWeight: '700' }}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={[styles.iconBtn, { borderColor: theme.border }]}>
          <Text style={{ color: theme.textSecondary, fontSize: FontSize.sm }}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <Text style={[styles.caption, { color: theme.textDisabled }]}>
          {keyLabel ? `Sa = ${keyLabel} · ` : ''}{placedCount}/{work.length} timed · confidence
        </Text>

        {/* ── Confidence ribbon ──────────────────────────────────────── */}
        <View style={styles.ribbon}>
          {work.map((n, i) => (
            <View key={i} style={{ flex: Math.max(0.4, n.duration || 0.4), backgroundColor: confColor(n, theme) + '55' }} />
          ))}
        </View>

        {/* ── Note lane ──────────────────────────────────────────────── */}
        <View
          style={[styles.lane, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onLayout={(e) => { laneWidthRef.current = e.nativeEvent.layout.width; }}
        >
          <View style={[styles.laneBaseline, { backgroundColor: theme.border }]} />
          {work.map((n, i) => {
            if (!isTimed(n)) return null;
            const color = confColor(n, theme);
            const isSel = i === selected;
            const top = LANE_H - 34 - degreeOf(n.note) * DEG_STEP;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => setSelected(i)}
                style={[styles.chip, {
                  left: pct(n.time),
                  width: pct(Math.max(n.duration, dur * 0.02)),
                  top,
                  backgroundColor: isSel ? theme.surface : color + '22',
                  borderColor: isSel ? theme.primary : color,
                  borderWidth: isSel ? 2 : 1.5,
                }]}
              >
                <Text numberOfLines={1} style={{ fontSize: FontSize.xs, fontWeight: '700', color: isSel ? theme.primary : color }}>
                  {n.note}{n.octave > 0 ? '·' : n.octave < 0 ? '.' : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
          {/* playhead */}
          <View style={[styles.playhead, { left: pct(currentVideoTime), backgroundColor: theme.primary }]} />

          {/* drag handles on the selected note's start/end edges */}
          {sel && isTimed(sel) && startPanRef.current && endPanRef.current && (
            <>
              <View
                {...startPanRef.current.panHandlers}
                style={[styles.dragHandle, {
                  left: pct(sel.time), top: LANE_H - 38 - degreeOf(sel.note) * DEG_STEP,
                  borderColor: theme.primary, backgroundColor: theme.primary + '22',
                }]}
              >
                <View style={[styles.dragGrip, { backgroundColor: theme.primary }]} />
              </View>
              <View
                {...endPanRef.current.panHandlers}
                style={[styles.dragHandle, {
                  left: pct(noteEnd(sel)), top: LANE_H - 38 - degreeOf(sel.note) * DEG_STEP,
                  borderColor: theme.primary, backgroundColor: theme.primary + '22',
                }]}
              >
                <View style={[styles.dragGrip, { backgroundColor: theme.primary }]} />
              </View>
            </>
          )}
        </View>

        {/* ── Lyric lane ─────────────────────────────────────────────── */}
        {hasLyrics && (
          <>
            <Text style={[styles.caption, { color: theme.textDisabled }]}>lyrics</Text>
            <View style={styles.lyricLane}>
              {lyricSpans.map((s, i) => (
                <View
                  key={i}
                  style={[styles.lyricBar, {
                    left: pct(s.start), width: pct(Math.max(s.end - s.start, dur * 0.02)),
                    backgroundColor: theme.background, borderColor: theme.border,
                  }]}
                >
                  <Text numberOfLines={1} style={{ fontSize: FontSize.xs, color: theme.textPrimary }}>{s.text}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── Pitch wheel (when a note is selected) ──────────────────── */}
        {sel && (
          <View style={[styles.pitchPanel, { backgroundColor: theme.surface, borderColor: theme.primary }]}>
            {/* selected note + its current timing */}
            <Text style={{ fontSize: FontSize.xs, color: theme.textSecondary, marginBottom: Spacing.xs }}>
              <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{sel.note}</Text>
              {'  '}start <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{sel.time.toFixed(2)}s</Text>
              {' → end '}<Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{noteEnd(sel).toFixed(2)}s</Text>
            </Text>

            {/* capture from playhead */}
            <View style={styles.nudgeRow}>
              <TouchableOpacity onPress={() => setFromPlayhead('start')} style={[styles.captureBtn, { borderColor: theme.success }]}>
                <Text style={{ fontSize: FontSize.xs, color: theme.success, fontWeight: '700' }}>▸ start = playhead</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFromPlayhead('end')} style={[styles.captureBtn, { borderColor: theme.error }]}>
                <Text style={{ fontSize: FontSize.xs, color: theme.error, fontWeight: '700' }}>end = playhead ◂</Text>
              </TouchableOpacity>
            </View>

            {/* fine nudge */}
            <Text style={{ fontSize: FontSize.xs, color: theme.textDisabled, marginBottom: Spacing.xs }}>
              drag the edges on the timeline, or fine-nudge:
            </Text>
            {(['start', 'end'] as const).map((field) => (
              <View key={field} style={styles.nudgeRow}>
                <Text style={[styles.nudgeLabel, { color: theme.textSecondary }]}>{field}</Text>
                {NUDGES.map((d) => (
                  <TouchableOpacity key={d} onPress={() => nudge(field, d)} style={[styles.nudgeChip, { borderColor: theme.border }]}>
                    <Text style={{ fontSize: FontSize.xs, color: theme.textSecondary, fontFamily: 'monospace' }}>
                      {d > 0 ? '+' : ''}{(d * 1000).toFixed(0)}ms
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}

            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <Text style={{ fontSize: FontSize.xs, color: theme.textSecondary, marginBottom: Spacing.xs }}>
              Retune <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{sel.note}</Text> — pick a svara
            </Text>
            <View style={styles.wheel}>
              {SVARA.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => retune(s)}
                  style={[styles.wheelChip, {
                    borderColor: s === sel.note ? theme.primary : theme.border,
                    backgroundColor: s === sel.note ? theme.primary + '18' : theme.background,
                  }]}
                >
                  <Text style={{ fontSize: FontSize.xs, fontWeight: '700', color: s === sel.note ? theme.primary : theme.textSecondary }}>{s}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={toggleOctave} style={[styles.wheelChip, { borderColor: theme.border, backgroundColor: theme.background }]}>
                <Text style={{ fontSize: FontSize.xs, fontWeight: '700', color: theme.textSecondary }}>
                  oct {sel.octave > 0 ? '+1' : sel.octave < 0 ? '-1' : '0'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Bottom controls ──────────────────────────────────────────── */}
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <TouchableOpacity
          onPress={handleTap}
          disabled={!nextNote}
          style={[styles.tapPad, { backgroundColor: theme.surface, borderColor: nextNote ? theme.primary : theme.border, opacity: nextNote ? 1 : 0.5 }]}
        >
          <Text style={{ fontSize: FontSize.lg, fontWeight: '700', color: theme.textPrimary }}>TAP</Text>
          <Text style={{ fontSize: FontSize.xs, color: theme.textDisabled }}>
            {nextNote ? `next: ${nextNote.note}` : 'all timed ✓'}
          </Text>
        </TouchableOpacity>
        <View style={styles.footerBtns}>
          <TouchableOpacity onPress={handleUndoTap} style={[styles.footerBtn, { borderColor: theme.border }]}>
            <Text style={{ fontSize: FontSize.xs, color: theme.textSecondary }}>↺ Undo tap</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNextIssue} style={[styles.footerBtn, { borderColor: theme.border }]}>
            <Text style={{ fontSize: FontSize.xs, color: theme.textSecondary }}>Next issue →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl },
  handle: { width: 40, height: 4, borderRadius: Radius.sm, alignSelf: 'center', marginVertical: Spacing.sm },
  topBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, borderBottomWidth: 0.5,
  },
  playBtn: { width: 34, height: 34, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  speedGroup: { flexDirection: 'row', gap: Spacing.xs },
  speedChip: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: Radius.sm, borderWidth: 1, minWidth: 34, alignItems: 'center' },
  saveBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.md, justifyContent: 'center' },
  iconBtn: { width: 34, height: 34, borderRadius: Radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

  body: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.lg },
  caption: { fontSize: FontSize.xs, marginTop: Spacing.sm, marginBottom: Spacing.xs },
  ribbon: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: Spacing.sm },

  lane: { position: 'relative', height: LANE_H, borderRadius: Radius.md, borderWidth: 0.5, overflow: 'hidden' },
  laneBaseline: { position: 'absolute', left: 0, right: 0, bottom: 20, height: 1 },
  chip: {
    position: 'absolute', height: 22, minWidth: 30, borderRadius: Radius.sm,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2, overflow: 'hidden',
  },
  playhead: { position: 'absolute', top: 0, bottom: 0, width: 2 },
  dragHandle: { position: 'absolute', width: 18, height: 30, marginLeft: -9, borderRadius: Radius.sm, borderWidth: 1, alignItems: 'center', justifyContent: 'center', zIndex: 5 },
  dragGrip: { width: 3, height: 16, borderRadius: 2 },

  lyricLane: { position: 'relative', height: 24, marginBottom: Spacing.sm },
  lyricBar: {
    position: 'absolute', top: 0, height: 22, borderRadius: Radius.sm, borderWidth: 0.5,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2, overflow: 'hidden',
  },

  pitchPanel: { marginTop: Spacing.sm, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 1 },
  captureBtn: { flex: 1, paddingVertical: Spacing.xs, borderRadius: Radius.sm, borderWidth: 1, alignItems: 'center' },
  nudgeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.xs },
  nudgeLabel: { fontSize: FontSize.xs, fontWeight: '600', width: 38 },
  nudgeChip: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: Radius.sm, borderWidth: 1, minWidth: 46, alignItems: 'center' },
  divider: { height: 0.5, marginVertical: Spacing.sm },
  wheel: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  wheelChip: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: Radius.sm, borderWidth: 1, minWidth: 40, alignItems: 'center' },

  footer: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.md, borderTopWidth: 0.5 },
  tapPad: { flex: 1, height: 58, borderRadius: Radius.lg, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  footerBtns: { width: 130, gap: Spacing.xs, justifyContent: 'center' },
  footerBtn: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm, borderRadius: Radius.md, borderWidth: 1, alignItems: 'center' },
});
