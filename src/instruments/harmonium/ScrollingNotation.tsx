import React, { memo, useRef, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Spacing, FontSize, Radius } from '@/src/design';
import type { Note } from './SargamPlayerEngine';

const NOTES_PER_ROW = 8;
const ROW_HEIGHT = 60;

interface ScrollingNotationProps {
  notes: Note[];
  activeNoteIndex: number;
  noteProgress: number;
  isTutor: boolean;
  onNotesEdit(notes: Note[]): void;
  isLandscape: boolean;
}

function ScrollingNotationInner({
  notes,
  activeNoteIndex,
  noteProgress,
  isTutor,
  onNotesEdit,
  isLandscape,
}: ScrollingNotationProps) {
  const { theme } = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  // Group notes into rows of NOTES_PER_ROW
  const rows: Note[][] = [];
  for (let i = 0; i < notes.length; i += NOTES_PER_ROW) {
    rows.push(notes.slice(i, i + NOTES_PER_ROW));
  }

  // Auto-scroll to keep active note visible
  useEffect(() => {
    if (activeNoteIndex < 0) return;
    const rowIndex = Math.floor(activeNoteIndex / NOTES_PER_ROW);
    const scrollY = Math.max(0, rowIndex * ROW_HEIGHT - ROW_HEIGHT);
    scrollRef.current?.scrollTo({ y: scrollY, animated: true });
  }, [activeNoteIndex]);

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

              return (
                <View
                  key={globalIndex}
                  style={[
                    styles.noteCell,
                    {
                      backgroundColor: isActive ? theme.primary : theme.surface,
                      borderColor: isActive ? theme.primary : theme.border,
                      opacity: isPast ? 0.35 : isFuture ? 0.20 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.noteText,
                      {
                        color: isActive ? theme.textOnPrimary : isPast ? theme.textSecondary : theme.textDisabled,
                        fontSize: isActive ? FontSize.md : FontSize.sm,
                      },
                    ]}
                  >
                    {note.note}
                  </Text>
                  {/* Progress underline for active note */}
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
                </View>
              );
            })}

            {/* Tutor edit button at end of row */}
            {isTutor && (
              <TouchableOpacity
                style={[styles.editBtn, { backgroundColor: theme.surfaceHigh }]}
                onPress={() => onNotesEdit(notes)}
                activeOpacity={0.7}
              >
                <Ionicons name="pencil" size={14} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
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
    p.isLandscape === n.isLandscape
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
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
});
