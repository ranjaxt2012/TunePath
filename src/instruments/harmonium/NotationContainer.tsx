import React, { memo, useEffect, useState, RefObject } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { ScrollingNotation } from './ScrollingNotation';
import { SargamPlayerEngine } from './SargamPlayerEngine';
import type { Note } from '@/src/utils/notation';

interface NotationContainerProps {
  engineRef: RefObject<SargamPlayerEngine | null>;
  notes: Note[];
  isTutor: boolean;
  onNotesEdit: (notes: Note[]) => void;
  isLandscape: boolean;
}

function NotationContainerComponent({
  engineRef,
  notes,
  isTutor,
  onNotesEdit,
  isLandscape,
}: NotationContainerProps) {
  const [activeNoteIndex, setActiveNoteIndex] = useState(-1);
  const [noteProgress, setNoteProgress] = useState(0);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.onIndexChange = setActiveNoteIndex;
    engine.onNoteProgress = setNoteProgress;
    engine.onComplete = () => setActiveNoteIndex(-1);
  }, [engineRef]);

  if (notes.length === 0) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="small" color="rgba(255,255,255,0.75)" />
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
        onNotesEdit={onNotesEdit}
        isLandscape={isLandscape}
      />
    </View>
  );
}

function areEqual(prev: NotationContainerProps, next: NotationContainerProps) {
  return (
    prev.notes === next.notes &&
    prev.isTutor === next.isTutor &&
    prev.isLandscape === next.isLandscape
  );
}

export const NotationContainer = memo(NotationContainerComponent, areEqual);

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
