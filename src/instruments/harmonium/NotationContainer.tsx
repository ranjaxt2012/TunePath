import React, { memo, useEffect, useState, RefObject } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme, FontSize } from '@/src/design';
import { ScrollingNotation } from './ScrollingNotation';
import { SargamPlayerEngine, type Note } from './SargamPlayerEngine';

interface NotationContainerProps {
  engineRef: RefObject<SargamPlayerEngine | null>;
  notes: Note[];
  isTutor: boolean;
  onNotesEdit(notes: Note[]): void;
  isLandscape: boolean;
}

function NotationContainerInner({ engineRef, notes, isTutor, onNotesEdit, isLandscape }: NotationContainerProps) {
  const { theme } = useTheme();
  const [activeNoteIndex, setActiveNoteIndex] = useState(-1);
  const [noteProgress, setNoteProgress] = useState(0);

  useEffect(() => {
    // Engine may not be ready on first render
    // Check every 100ms until it's available
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
        onNotesEdit={onNotesEdit}
        isLandscape={isLandscape}
      />
    </View>
  );
}

function arePropsEqual(p: NotationContainerProps, n: NotationContainerProps) {
  return p.notes === n.notes && p.isLandscape === n.isLandscape;
}

export const NotationContainer = memo(NotationContainerInner, arePropsEqual);

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
