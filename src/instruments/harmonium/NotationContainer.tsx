import React, { memo, useEffect, useState, RefObject } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, FontSize, Spacing, Radius } from '@/src/design';
import type { Note } from '@/src/hooks/useLesson';
import { ScrollingNotation } from './ScrollingNotation';
import { SargamRollView } from './SargamRollView';
import { SargamPlayerEngine } from './SargamPlayerEngine';

interface NotationContainerProps {
  engineRef: RefObject<SargamPlayerEngine | null>;
  notes: Note[];
  isTutor: boolean;
  onNotesEdit(notes: Note[]): void;
  isLandscape: boolean;
  editMode: boolean;
  snapToBeat: boolean;
  bpm: number;
  firstBeat: number;
  currentTimeRef: React.MutableRefObject<number>;
  videoDuration: number;
  videoRef?: React.RefObject<any>;
  onRowEditOpen(rowIndex: number): void;
}

function NotationContainerInner({
  engineRef,
  notes,
  isTutor,
  onNotesEdit,
  isLandscape,
  editMode,
  snapToBeat,
  bpm,
  firstBeat,
  currentTimeRef,
  videoDuration,
  videoRef,
  onRowEditOpen,
}: NotationContainerProps) {
  const { theme } = useTheme();
  const [activeNoteIndex, setActiveNoteIndex] = useState(-1);
  const [noteProgress, setNoteProgress] = useState(0);
  const [rollView, setRollView] = useState(true);

  useEffect(() => {
    const attach = () => {
      const engine = engineRef.current;
      if (!engine) return false;
      engine.onIndexChange = setActiveNoteIndex;
      engine.onNoteProgress = setNoteProgress;
      engine.onComplete = () => setActiveNoteIndex(-1);
      return true;
    };

    if (attach()) return;

    const interval = setInterval(() => {
      if (attach()) clearInterval(interval);
    }, 100);

    return () => clearInterval(interval);
  }, [engineRef]);

  if (notes.length === 0) {
    return (
      <View style={styles.empty}>
        <Text
          style={{
            color: theme.textDisabled,
            fontSize: FontSize.sm,
            textAlign: 'center',
          }}
        >
          {isTutor ? '🎵 No notation yet — edit to add notes' : '🎵 No notation available'}
        </Text>
      </View>
    );
  }

  // Roll view is read-only, so it's only offered outside edit mode; editing
  // stays on the classic notation (which carries the per-row edit affordances).
  const showRoll = rollView && !editMode;

  return (
    <View style={styles.container}>
      {!editMode && (
        <View style={styles.toggleRow}>
          {(['roll', 'classic'] as const).map((mode) => {
            const on = (mode === 'roll') === rollView;
            return (
              <TouchableOpacity
                key={mode}
                onPress={() => setRollView(mode === 'roll')}
                style={[styles.toggleChip, {
                  backgroundColor: on ? theme.primary + '18' : 'transparent',
                  borderColor: on ? theme.primary : theme.border,
                }]}
              >
                <Text style={{ fontSize: FontSize.xs, fontWeight: '700', color: on ? theme.primary : theme.textSecondary }}>
                  {mode === 'roll' ? 'Roll' : 'Classic'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {showRoll ? (
        <SargamRollView notes={notes} activeNoteIndex={activeNoteIndex} currentTimeRef={currentTimeRef} />
      ) : (
        <ScrollingNotation
          notes={notes}
          activeNoteIndex={activeNoteIndex}
          noteProgress={noteProgress}
          isTutor={isTutor}
          isLandscape={isLandscape}
          editMode={editMode}
          snapToBeat={snapToBeat}
          bpm={bpm}
          firstBeat={firstBeat}
          currentTimeRef={currentTimeRef}
          onNotesEdit={onNotesEdit}
          onRowEdit={(rowIndex) => onRowEditOpen(rowIndex)}
        />
      )}
    </View>
  );
}

function arePropsEqual(p: NotationContainerProps, n: NotationContainerProps) {
  return (
    p.notes === n.notes &&
    p.isLandscape === n.isLandscape &&
    p.isTutor === n.isTutor &&
    p.editMode === n.editMode &&
    p.snapToBeat === n.snapToBeat &&
    p.bpm === n.bpm &&
    p.firstBeat === n.firstBeat &&
    p.currentTimeRef === n.currentTimeRef &&
    p.videoDuration === n.videoDuration &&
    p.videoRef === n.videoRef
  );
}

export const NotationContainer = memo(NotationContainerInner, arePropsEqual);

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  toggleRow: { flexDirection: 'row', gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  toggleChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.sm, borderWidth: 1 },
});
