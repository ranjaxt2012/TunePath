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
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, Radius, Spacing, Typography } from '@/src/constants/theme';
import { chunkNotes } from '@/src/utils/notation';
import type { Note } from '@/src/utils/notation';

const LINE_HEIGHT = 56;
const NOTES_PER_LINE = 4;
const FADE_COLOR = Colors.bgPrimary;

type ScrollingNotationProps = {
  notes: Note[];
  activeNoteIndex: number;
};

export function ScrollingNotation({ notes, activeNoteIndex }: ScrollingNotationProps) {
  const [panelHeight, setPanelHeight] = useState(200);
  const [dismissed, setDismissed] = useState<Set<number>>(() => new Set());
  const scrollRef = useRef<ScrollView>(null);

  const lines = React.useMemo(() => chunkNotes(notes, NOTES_PER_LINE), [notes]);
  const activeLine = activeNoteIndex < 0 ? -2 : Math.floor(activeNoteIndex / NOTES_PER_LINE);
  const activeNoteInLine = activeNoteIndex < 0 ? 0 : activeNoteIndex % NOTES_PER_LINE;

  const onPanelLayout = useCallback((e: LayoutChangeEvent) => {
    setPanelHeight(e.nativeEvent.layout.height);
  }, []);

  useEffect(() => {
    const y = activeLine < 0 ? 0 : Math.max(0, activeLine * LINE_HEIGHT - panelHeight * 0.3);
    scrollRef.current?.scrollTo({ y, animated: true });
  }, [activeLine, panelHeight]);

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
              isCompleted={isCompleted}
              isActiveLine={isActiveLine}
              isNextLine={isNextLine}
              isFuture={isFuture}
              onDismiss={handleDismiss}
            />
          );
        })}
      </ScrollView>
      <LinearGradient
        colors={[FADE_COLOR, 'transparent']}
        style={styles.fadeTop}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', FADE_COLOR]}
        style={styles.fadeBottom}
        pointerEvents="none"
      />
    </View>
  );
}

type NotationLineProps = {
  lineIndex: number;
  line: Note[];
  activeNoteInLine: number;
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
          styles.line,
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
        styles.line,
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
        <View style={styles.cellActiveInner}>
          {renderContent(styles.cellTextActive)}
        </View>
      </Animated.View>
    );
  }

  if (isNextNote) {
    return (
      <View style={styles.cell}>
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
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: Spacing.md,
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: 64,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    height: LINE_HEIGHT,
  },
  lineActive: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: Radius.md,
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  lineNext: {
    opacity: 0.5,
  },
  lineFuture: {
    opacity: 0.25,
  },
  cell: {
    flex: 1,
    height: LINE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  cellActive: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellActiveInner: {
    backgroundColor: Colors.bgPrimary,
    borderRadius: Radius.md,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignSelf: 'center',
  },
  cellTextActive: {
    fontSize: FontSize.md,
    fontFamily: Typography.bold,
    color: Colors.textPrimary,
  },
  cellLyric: {
    fontSize: FontSize.xs,
    fontFamily: Typography.regular,
    color: Colors.textPrimary,
    opacity: 0.7,
    marginTop: 2,
  },
  cellTextNext: {
    fontSize: FontSize.md,
    fontFamily: Typography.regular,
    color: Colors.textSecondary,
    opacity: 0.7,
  },
  cellTextPast: {
    fontSize: FontSize.md,
    fontFamily: Typography.regular,
    color: Colors.textSecondary,
    opacity: 0.2,
  },
  cellTextFuture: {
    fontSize: FontSize.md,
    fontFamily: Typography.regular,
    color: Colors.textSecondary,
  },
  fadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 32,
    pointerEvents: 'none',
  },
  fadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 32,
    pointerEvents: 'none',
  },
});
