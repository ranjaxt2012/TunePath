import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, type DimensionValue } from 'react-native';
import { useTheme, FontSize, Radius, Spacing } from '@/src/design';
import type { Note } from '@/src/hooks/useLesson';

// Read-only learner view: notes on a time-proportional roll (width = duration,
// height = pitch). Playhead is pinned; the track auto-scrolls to follow the video.
const SVARA = ['Sa', 'Re', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni'] as const;
const PPS = 80;            // pixels per second
const PLAYHEAD_X = 110;    // pinned playhead offset from the left edge
const LANE_H = 140;
const DEG_STEP = 14;

const degreeOf = (name: string) => {
  const i = SVARA.indexOf(name as (typeof SVARA)[number]);
  return i < 0 ? 0 : i;
};

interface Props {
  notes: Note[];
  activeNoteIndex: number;
  currentTimeRef: React.MutableRefObject<number>;
}

export function SargamRollView({ notes, activeNoteIndex, currentTimeRef }: Props) {
  const { theme } = useTheme();
  const scrollRef = useRef<ScrollView | null>(null);

  // Follow the playhead every frame without re-rendering React.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const x = Math.max(0, currentTimeRef.current * PPS - PLAYHEAD_X);
      scrollRef.current?.scrollTo({ x, animated: false });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [currentTimeRef]);

  const lastEnd = notes.length ? notes[notes.length - 1].time + notes[notes.length - 1].duration : 0;
  const trackWidth = lastEnd * PPS + 400;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ width: trackWidth as DimensionValue, height: LANE_H }}
      >
        <View style={{ width: trackWidth, height: LANE_H }}>
          <View style={[styles.baseline, { backgroundColor: theme.border }]} />
          {notes.map((n, i) => {
            const active = i === activeNoteIndex;
            const left = n.time * PPS;
            const width = Math.max(n.duration * PPS - 4, 28);
            const top = LANE_H - 34 - degreeOf(n.note) * DEG_STEP;
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
        </View>
      </ScrollView>
      {/* pinned playhead */}
      <View pointerEvents="none" style={[styles.playhead, { left: PLAYHEAD_X, backgroundColor: theme.primary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: LANE_H, justifyContent: 'center' },
  baseline: { position: 'absolute', left: 0, right: 0, bottom: 22, height: 1 },
  chip: {
    position: 'absolute', height: 26, minWidth: 28, borderRadius: Radius.sm, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xs,
  },
  playhead: { position: 'absolute', top: 0, bottom: 0, width: 2 },
});
