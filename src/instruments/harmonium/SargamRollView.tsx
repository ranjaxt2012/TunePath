import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useTheme, FontSize, Radius, Spacing } from '@/src/design';
import type { Note } from '@/src/hooks/useLesson';

// Read-only learner view: notes on a time-proportional roll (width = duration,
// height = pitch). The playhead is pinned and the track rolls continuously
// under it — the current note stays under the playhead from start to end
// (no clamp/stop when the tail fits on screen).
// Full 12-tone svara map (komal lowercase, tivra 'ma') so every note gets a
// correct pitch height — not just the 7 shuddha svaras.
const CHROMA: Record<string, number> = {
  Sa: 0, re: 1, Re: 2, ga: 3, Ga: 4, Ma: 5, ma: 6, Pa: 7, dha: 8, Dha: 9, ni: 10, Ni: 11,
};
const PPS = 80;            // pixels per second
const PLAYHEAD_X = 110;    // pinned playhead offset from the left edge
const LANE_H = 168;
const CHIP_H = 24;
const PAD = 12;

// Pitch level across octaves: e.g. mandra Pa = -5, tar Sa = +12.
const levelOf = (n: Note) => (CHROMA[n.note] ?? 0) + 12 * (n.octave || 0);

interface Props {
  notes: Note[];
  activeNoteIndex: number;
  currentTimeRef: React.MutableRefObject<number>;
}

export function SargamRollView({ notes, activeNoteIndex, currentTimeRef }: Props) {
  const { theme } = useTheme();
  const translateX = useRef(new Animated.Value(PLAYHEAD_X)).current;

  // Roll the track so the current time sits under the pinned playhead, every
  // frame, without re-rendering React. translateX goes negative past the start
  // — no clamp — so it keeps rolling smoothly all the way to the end.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      translateX.setValue(PLAYHEAD_X - currentTimeRef.current * PPS);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [translateX, currentTimeRef]);

  const lastEnd = notes.length ? notes[notes.length - 1].time + notes[notes.length - 1].duration : 0;
  const trackWidth = lastEnd * PPS + 200;

  // Fit the actual pitch range (this lesson's low→high note) into the lane so
  // notes spread out and use the full height — higher pitch sits higher.
  const levels = notes.map(levelOf);
  const maxL = levels.length ? Math.max(...levels) : 11;
  const minL = levels.length ? Math.min(...levels) : 0;
  const span = Math.max(maxL - minL, 7);
  const usable = LANE_H - CHIP_H - PAD * 2;
  const topOf = (lvl: number) => PAD + ((maxL - lvl) / span) * usable;

  return (
    <View style={styles.container}>
      <Animated.View style={{ width: trackWidth, height: LANE_H, transform: [{ translateX }] }}>
        {notes.map((n, i) => {
          const active = i === activeNoteIndex;
          const left = n.time * PPS;
          const width = Math.max(n.duration * PPS - 4, 46);   // min width so labels never truncate
          const top = topOf(levelOf(n));
          return (
            <View
              key={i}
              style={[styles.chip, {
                left, width, top,
                backgroundColor: active ? theme.primary : theme.success + '22',
                borderColor: active ? theme.primary : theme.success,
              }]}
            >
              <Text numberOfLines={1} style={{
                fontSize: FontSize.sm, fontWeight: '700',
                color: active ? theme.textOnPrimary : theme.success,
              }}>
                {n.note}{n.octave > 0 ? '·' : n.octave < 0 ? '.' : ''}
              </Text>
            </View>
          );
        })}
      </Animated.View>
      {/* pinned playhead */}
      <View pointerEvents="none" style={[styles.playhead, { left: PLAYHEAD_X, backgroundColor: theme.primary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: LANE_H, justifyContent: 'center', overflow: 'hidden' },
  chip: {
    position: 'absolute', height: CHIP_H, minWidth: 46, borderRadius: Radius.sm, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xs,
  },
  playhead: { position: 'absolute', top: 0, bottom: 0, width: 2 },
});
