import React, { memo } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Spacing, FontSize, Radius } from '@/src/design';
import type { Note } from '@/src/hooks/useLesson';

const NOTES_PER_ROW = 8;
const ROW_HEIGHT = 60;

function snapTime(rawTime: number, bpm: number, firstBeat: number): number {
  const beatDuration = 60 / bpm;
  const beatNumber = Math.round((rawTime - firstBeat) / beatDuration);
  return beatNumber * beatDuration + firstBeat;
}

interface ScrollingNotationProps {
  notes: Note[];
  activeNoteIndex: number;
  noteProgress: number;
  isTutor: boolean;
  isLandscape: boolean;
  editMode: boolean;
  snapToBeat: boolean;
  bpm: number;
  firstBeat: number;
  currentTimeRef: React.MutableRefObject<number>;
  onNotesEdit(notes: Note[]): void;
  onNotePencilPress(globalIndex: number): void;
}

function ScrollingNotationInner({
  notes,
  activeNoteIndex,
  noteProgress,
  isTutor,
  isLandscape,
  editMode,
  snapToBeat,
  bpm,
  firstBeat,
  currentTimeRef,
  onNotesEdit,
  onNotePencilPress,
}: ScrollingNotationProps) {
  const { theme } = useTheme();
  const scrollRef = React.useRef<ScrollView>(null);

  // Group notes into rows of NOTES_PER_ROW
  const rows: Note[][] = [];
  for (let i = 0; i < notes.length; i += NOTES_PER_ROW) {
    rows.push(notes.slice(i, i + NOTES_PER_ROW));
  }

  // Auto-scroll to keep active note visible
  React.useEffect(() => {
    if (activeNoteIndex < 0) return;
    const rowIndex = Math.floor(activeNoteIndex / NOTES_PER_ROW);
    const scrollY = Math.max(0, rowIndex * ROW_HEIGHT - ROW_HEIGHT);
    scrollRef.current?.scrollTo({ y: scrollY, animated: true });
  }, [activeNoteIndex]);

  const handleNotePress = (globalIndex: number) => {
    if (!editMode) return;
    const raw = currentTimeRef.current;
    const stamped = snapToBeat ? snapTime(raw, bpm, firstBeat) : raw;

    const updated = [...notes];
    const nextTime = updated[globalIndex + 1]?.time ?? stamped + 60 / bpm;
    updated[globalIndex] = {
      ...updated[globalIndex],
      time: stamped,
      duration: nextTime - stamped,
    };
    onNotesEdit(updated);
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.scroll}
      contentContainerStyle={[styles.content, isLandscape && styles.contentLandscape]}
      showsVerticalScrollIndicator={false}
      scrollEnabled
    >
      {rows.map((rowNotes, rowIndex) => {
        const rowStartIndex = rowIndex * NOTES_PER_ROW;
        return (
          <View key={rowIndex} style={styles.row}>
            {rowNotes.map((note, colIndex) => {
              const globalIndex = rowStartIndex + colIndex;
              const isActive = globalIndex === activeNoteIndex;
              const isPast = globalIndex < activeNoteIndex;
              const isFuture = globalIndex > activeNoteIndex;

              const cellStyle = [
                styles.noteCell,
                {
                  backgroundColor: isActive ? theme.primary : theme.surface,
                  borderColor:
                    editMode && note.time > 0
                      ? theme.success
                      : isActive
                        ? theme.primary
                        : theme.border,
                  opacity: isPast ? 0.35 : isFuture ? 0.2 : 1,
                },
              ];

              const cellContent = (
                <>
                  <Text
                    style={[
                      styles.noteText,
                      {
                        color: isActive
                          ? theme.textOnPrimary
                          : isPast
                            ? theme.textSecondary
                            : theme.textDisabled,
                        fontSize: isActive ? FontSize.md : FontSize.sm,
                      },
                    ]}
                  >
                    {note.note}
                  </Text>
                  {isActive && noteProgress > 0 && (
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${noteProgress * 100}%`,
                          backgroundColor: theme.textOnPrimary,
                        },
                      ]}
                    />
                  )}
                  {isTutor && (
                    <TouchableOpacity
                      style={[
                        styles.pencilOverlay,
                        {
                          backgroundColor: theme.surfaceHigh,
                        },
                      ]}
                      onPress={() => onNotePencilPress(globalIndex)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="pencil"
                        size={10}
                        color={theme.textSecondary}
                      />
                    </TouchableOpacity>
                  )}
                </>
              );

              if (editMode) {
                return (
                  <TouchableOpacity
                    key={globalIndex}
                    onPress={() => handleNotePress(globalIndex)}
                    style={cellStyle}
                    activeOpacity={0.7}
                  >
                    {cellContent}
                  </TouchableOpacity>
                );
              }
              return (
                <View key={globalIndex} style={cellStyle}>
                  {cellContent}
                </View>
              );
            })}
          </View>
        );
      })}
    </ScrollView>
  );
}

function arePropsEqual(p: ScrollingNotationProps, n: ScrollingNotationProps) {
  return (
    p.notes === n.notes &&
    p.activeNoteIndex === n.activeNoteIndex &&
    p.noteProgress === n.noteProgress &&
    p.isTutor === n.isTutor &&
    p.isLandscape === n.isLandscape &&
    p.editMode === n.editMode &&
    p.snapToBeat === n.snapToBeat &&
    p.bpm === n.bpm &&
    p.firstBeat === n.firstBeat &&
    p.currentTimeRef === n.currentTimeRef
  );
}

export const ScrollingNotation = memo(ScrollingNotationInner, arePropsEqual);

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  contentLandscape: {
    padding: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: ROW_HEIGHT,
    flexWrap: 'nowrap',
  },
  noteCell: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  noteText: {
    fontWeight: '700',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 3,
    opacity: 0.7,
  },
  pencilOverlay: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
