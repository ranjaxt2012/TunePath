import React, { memo, useEffect, useState, RefObject } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, FontSize } from '@/src/design';
import type { Note } from '@/src/hooks/useLesson';
import { ScrollingNotation } from './ScrollingNotation';
import { RowTimingEditor } from './RowTimingEditor';
import { SargamPlayerEngine } from './SargamPlayerEngine';

const NOTES_PER_ROW = 8;

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
}: NotationContainerProps) {
  const { theme } = useTheme();
  const [activeNoteIndex, setActiveNoteIndex] = useState(-1);
  const [noteProgress, setNoteProgress] = useState(0);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);

  // Compute rows to pass correct rowNotes to editor
  const rows: Note[][] = [];
  for (let i = 0; i < notes.length; i += NOTES_PER_ROW) {
    rows.push(notes.slice(i, i + NOTES_PER_ROW));
  }

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
        onRowEdit={(rowIndex) => setEditingRowIndex(rowIndex)}
      />

      <RowTimingEditor
        visible={editingRowIndex !== null}
        rowIndex={editingRowIndex ?? 0}
        rowNotes={editingRowIndex !== null ? (rows[editingRowIndex] ?? []) : []}
        videoDuration={videoDuration}
        totalRows={rows.length}
        videoRef={videoRef ?? { current: null }}
        onSave={(updatedRowNotes) => {
          if (editingRowIndex === null) return;
          const allNotes = [...notes];
          const start = editingRowIndex * NOTES_PER_ROW;
          updatedRowNotes.forEach((n, i) => {
            allNotes[start + i] = n;
          });
          onNotesEdit(allNotes);
          setEditingRowIndex(null);
        }}
        onClose={() => setEditingRowIndex(null)}
        onPrevRow={() => {
          if (editingRowIndex !== null && editingRowIndex > 0) {
            setEditingRowIndex(editingRowIndex - 1);
          }
        }}
        onNextRow={() => {
          if (editingRowIndex !== null && editingRowIndex < rows.length - 1) {
            setEditingRowIndex(editingRowIndex + 1);
          }
        }}
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
    p.currentTimeRef === n.currentTimeRef &&
    p.videoDuration === n.videoDuration &&
    p.videoRef === n.videoRef
  );
}

export const NotationContainer = memo(NotationContainerInner, arePropsEqual);

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
