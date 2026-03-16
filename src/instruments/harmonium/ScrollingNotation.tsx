/**
 * ScrollingNotation — karaoke-style notation panel.
 * All notes visible upfront. Completed lines vanish (slide up + fade).
 * Active note highlighted; next line dim preview. ScrollView with auto-scroll.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
  Easing,
  LayoutChangeEvent,
} from 'react-native';
import { Colors, FontSize, Radius, Spacing, Typography } from '@/src/constants/theme';
import { chunkNotes } from '@/src/utils/notation';
import type { Note } from '@/src/utils/notation';

const LINE_HEIGHT = 56;
const NOTES_PER_LINE = 4;

type ScrollingNotationProps = {
  notes: Note[];
  activeNoteIndex: number;
  noteProgress: number; // 0.0 → 1.0 through current note
};

export function ScrollingNotation({ notes, activeNoteIndex, noteProgress }: ScrollingNotationProps) {
  const [panelHeight, setPanelHeight] = useState(300);
  const [dismissed, setDismissed] = useState<Set<number>>(() => new Set());
  const scrollRef = useRef<ScrollView>(null);

  const lines = React.useMemo(() => chunkNotes(notes, NOTES_PER_LINE), [notes]);
  const activeLine = activeNoteIndex < 0 ? -2 : Math.floor(activeNoteIndex / NOTES_PER_LINE);
  const activeNoteInLine = activeNoteIndex < 0 ? 0 : activeNoteIndex % NOTES_PER_LINE;

  const activeNoteOpacity = noteProgress < 0.6
    ? 1.0
    : 1.0 - ((noteProgress - 0.6) / 0.4) * 0.3;
  const nextNoteOpacity = noteProgress > 0.8
    ? 0.4 + ((noteProgress - 0.8) / 0.2) * 0.3
    : 0.25;
  const nextNoteScale = noteProgress > 0.8
    ? 1.0 + ((noteProgress - 0.8) / 0.2) * 0.08
    : 1.0;

  const onPanelLayout = useCallback((e: LayoutChangeEvent) => {
    setPanelHeight(e.nativeEvent.layout.height);
  }, []);

  useEffect(() => {
    if (activeNoteIndex === -1) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      setDismissed(new Set());
      return;
    }
    const activeLineIdx = Math.floor(activeNoteIndex / NOTES_PER_LINE);
    const y = Math.max(0, activeLineIdx * LINE_HEIGHT - panelHeight * 0.3);
    scrollRef.current?.scrollTo({ y, animated: activeNoteIndex > -1 });
  }, [activeNoteIndex, panelHeight]);

  const prevActiveIndexRef = useRef(activeNoteIndex);
  useEffect(() => {
    const prev = prevActiveIndexRef.current;
    prevActiveIndexRef.current = activeNoteIndex;
    if (activeNoteIndex < 0 || activeNoteIndex >= prev) return;
    const activeLine = Math.floor(activeNoteIndex / NOTES_PER_LINE);
    setDismissed((prevSet) => {
      const next = new Set(prevSet);
      [...next].forEach((lineIndex) => {
        if (lineIndex >= activeLine) next.delete(lineIndex);
      });
      return next;
    });
  }, [activeNoteIndex]);

  const handleDismiss = useCallback((lineIndex: number) => {
    setDismissed((prev) => new Set(prev).add(lineIndex));
  }, []);

  return (
    <View
      style={styles.panel}
      onLayout={onPanelLayout}
      pointerEvents="box-none"
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {lines.map((line, lineIdx) => {
          if (dismissed.has(lineIdx)) return null;
          const isCompleted = lineIdx < activeLine;
          const isActiveLine = lineIdx === activeLine;
          const isNextLine = lineIdx === activeLine + 1;
          const isFuture = lineIdx > activeLine + 1;
          return (
            <NotationLine
              key={lineIdx}
              lineIndex={lineIdx}
              line={line}
              activeNoteInLine={activeNoteInLine}
              activeNoteOpacity={activeNoteOpacity}
              nextNoteOpacity={nextNoteOpacity}
              nextNoteScale={nextNoteScale}
              isCompleted={isCompleted}
              isActiveLine={isActiveLine}
              isNextLine={isNextLine}
              isFuture={isFuture}
              onDismiss={handleDismiss}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

type NotationLineProps = {
  lineIndex: number;
  line: Note[];
  activeNoteInLine: number;
  activeNoteOpacity: number;
  nextNoteOpacity: number;
  nextNoteScale: number;
  isCompleted: boolean;
  isActiveLine: boolean;
  isNextLine: boolean;
  isFuture: boolean;
  onDismiss: (lineIndex: number) => void;
};

function NotationLine({
  lineIndex,
  line,
  activeNoteInLine,
  activeNoteOpacity,
  nextNoteOpacity,
  nextNoteScale,
  isCompleted,
  isActiveLine,
  isNextLine,
  isFuture,
  onDismiss,
}: NotationLineProps) {
  const flatStart = lineIndex * NOTES_PER_LINE;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const hasAnimatedOut = useRef(false);

  useEffect(() => {
    if (!isCompleted || hasAnimatedOut.current) return;
    hasAnimatedOut.current = true;
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -20,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start(() => onDismiss(lineIndex));
  }, [isCompleted, lineIndex, onDismiss, translateY, opacity]);

  if (isCompleted) {
    return (
      <Animated.View
        style={[
          styles.lineBase,
          {
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        {line.map((n, cellIdx) => (
          <View key={flatStart + cellIdx} style={styles.cell}>
            <Text style={styles.cellTextFuture}>{n.note}</Text>
            {n.lyric ? <Text style={styles.cellLyric}>{n.lyric}</Text> : null}
          </View>
        ))}
      </Animated.View>
    );
  }

  return (
    <View
      style={[
        styles.lineBase,
        isActiveLine && styles.lineActive,
        isNextLine && styles.lineNext,
        isFuture && styles.lineFuture,
      ]}
    >
      {line.map((n, cellIdx) => {
        const flatIdx = flatStart + cellIdx;
        const isActive = isActiveLine && cellIdx === activeNoteInLine;
        const isNextNote = isActiveLine && cellIdx === activeNoteInLine + 1;
        const isPastInLine = isActiveLine && cellIdx < activeNoteInLine;
        const isFutureInLine = isActiveLine && cellIdx > activeNoteInLine + 1;
        return (
          <NoteCell
            key={flatIdx}
            note={n.note}
            lyric={n.lyric}
            isActive={isActive}
            isNextNote={isNextNote}
            activeNoteOpacity={activeNoteOpacity}
            nextNoteOpacity={nextNoteOpacity}
            nextNoteScale={nextNoteScale}
            isPastInLine={isPastInLine}
            isFutureInLine={isFutureInLine}
            isNextLine={isNextLine}
            isFuture={isFuture}
          />
        );
      })}
    </View>
  );
}

type NoteCellProps = {
  note: string;
  lyric?: string;
  isActive: boolean;
  isNextNote: boolean;
  activeNoteOpacity: number;
  nextNoteOpacity: number;
  nextNoteScale: number;
  isPastInLine: boolean;
  isFutureInLine: boolean;
  isNextLine: boolean;
  isFuture: boolean;
};

function NoteCell({
  note,
  lyric,
  isActive,
  isNextNote,
  activeNoteOpacity,
  nextNoteOpacity,
  nextNoteScale,
  isPastInLine,
  isFutureInLine,
  isNextLine,
  isFuture,
}: NoteCellProps) {
  const scaleAnim = useRef(new Animated.Value(isActive ? 1.15 : 1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isActive ? 1.15 : 1,
      useNativeDriver: true,
      tension: 80,
      friction: 8,
    }).start();
  }, [isActive, scaleAnim]);

  const renderContent = (mainStyle: object, lyricStyle: object = styles.cellLyric) => (
    <>
      <Text style={mainStyle}>{note}</Text>
      {lyric ? <Text style={lyricStyle}>{lyric}</Text> : null}
    </>
  );

  if (isActive) {
    return (
      <Animated.View
        style={[styles.cell, styles.cellActive, { transform: [{ scale: scaleAnim }] }]}
      >
        <View style={[styles.cellActiveInner, { opacity: activeNoteOpacity }]}>
          {renderContent(styles.cellTextActive)}
        </View>
      </Animated.View>
    );
  }

  if (isNextNote) {
    return (
      <View
        style={[
          styles.cell,
          { opacity: nextNoteOpacity, transform: [{ scale: nextNoteScale }] },
        ]}
      >
        {renderContent(styles.cellTextNext)}
      </View>
    );
  }

  if (isPastInLine) {
    return (
      <View style={styles.cell}>
        {renderContent(styles.cellTextPast)}
      </View>
    );
  }

  if (isFutureInLine) {
    return (
      <View style={styles.cell}>
        {renderContent(styles.cellTextNext)}
      </View>
    );
  }

  return (
    <View style={styles.cell}>
      {renderContent(styles.cellTextFuture)}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    width: '100%',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  lineBase: {
    flexDirection: 'row',
    height: 56,
  },
  lineActive: {
    flexDirection: 'row',
    height: 56,
  },
  lineNext: {
    flexDirection: 'row',
    height: 56,
    opacity: 0.5,
  },
  lineFuture: {
    flexDirection: 'row',
    height: 56,
    opacity: 0.25,
  },
  linePast: {
    flexDirection: 'row',
    height: 56,
    opacity: 0,
  },
  cell: {
    flex: 1,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellActive: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellActiveInner: {
    backgroundColor: Colors.bgPrimary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  cellTextActive: {
    fontFamily: Typography.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  cellTextNext: {
    fontFamily: Typography.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  cellTextFuture: {
    fontFamily: Typography.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  cellTextPast: {
    fontFamily: Typography.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    opacity: 0.2,
  },
  cellLyric: {
    fontFamily: Typography.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    opacity: 0.7,
    marginTop: 2,
  },
});
