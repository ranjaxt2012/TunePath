import React, { memo, useEffect, useState, RefObject } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, FontSize, Spacing } from '@/src/design';
import type { Note } from '@/src/hooks/useLesson';
import { ScrollingNotation } from './ScrollingNotation';
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
}: NotationContainerProps) {
  const { theme } = useTheme();
  const [activeNoteIndex, setActiveNoteIndex] = useState(-1);
  const [noteProgress, setNoteProgress] = useState(0);

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
          🎵 Notation loading...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
      />
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
    p.currentTimeRef === n.currentTimeRef
  );
}

export const NotationContainer = memo(NotationContainerInner, arePropsEqual);

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
