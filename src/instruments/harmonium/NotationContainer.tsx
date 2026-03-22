import React, { memo, useEffect, useState, useCallback, RefObject } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme, FontSize, Spacing, Radius } from '@/src/design';
import type { Note } from '@/src/hooks/useLesson';
import { ScrollingNotation } from './ScrollingNotation';
import { SargamPlayerEngine } from './SargamPlayerEngine';

interface NotationContainerProps {
  engineRef: RefObject<SargamPlayerEngine | null>;
  notes: Note[];
  isTutor: boolean;
  onNotesEdit(notes: Note[]): void;
  isLandscape: boolean;
}

const NOTES_PER_ROW = 8;

function NotationContainerInner({ engineRef, notes, isTutor, onNotesEdit, isLandscape }: NotationContainerProps) {
  const { theme } = useTheme();
  const [activeNoteIndex, setActiveNoteIndex] = useState(-1);
  const [noteProgress, setNoteProgress] = useState(0);
  const [editingRow, setEditingRow] = useState<{
    rowIndex: number;
    notes: Note[];
  } | null>(null);
  const [startStrings, setStartStrings] = useState<string[]>([]);
  const [endStrings, setEndStrings] = useState<string[]>([]);

  useEffect(() => {
    if (editingRow) {
      setStartStrings(editingRow.notes.map((n) => String(n.time)));
      setEndStrings(editingRow.notes.map((n) => String(n.time + n.duration)));
    }
  }, [editingRow?.rowIndex]);

  const handleRowEdit = useCallback((rowIndex: number, rowNotes: Note[]) => {
    setEditingRow({
      rowIndex,
      notes: [...rowNotes],
    });
  }, []);

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
        onRowEdit={handleRowEdit}
        isLandscape={isLandscape}
      />

      <Modal
        visible={editingRow !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingRow(null)}
      >
        <View
          style={[
            styles.modalOverlay,
            { backgroundColor: 'rgba(0,0,0,0.5)' },
          ]}
        >
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: theme.modalBg },
            ]}
          >
            <View style={styles.handle} />
            <Text
              style={[
                styles.modalTitle,
                { color: theme.textPrimary },
              ]}
            >
              Edit Row {(editingRow?.rowIndex ?? 0) + 1}
            </Text>

            <Text
              style={[
                styles.rowLabel,
                { color: theme.textDisabled, fontSize: FontSize.sm },
              ]}
            >
              Note   Start    End
            </Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {editingRow?.notes.map((note, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.noteEditRow,
                    { borderBottomColor: theme.border },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.notePill,
                      {
                        color: theme.textPrimary,
                        borderColor: theme.border,
                        backgroundColor: theme.surface,
                      },
                    ]}
                    value={note.note}
                    onChangeText={(text) => {
                      const updated = [...editingRow.notes];
                      updated[idx] = {
                        ...updated[idx],
                        note: text.trim(),
                        lyric: text.trim(),
                      };
                      setEditingRow({
                        ...editingRow,
                        notes: updated,
                      });
                    }}
                    placeholder="Sa"
                    placeholderTextColor={theme.textDisabled}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                  <TextInput
                    style={[
                      styles.timeInput,
                      {
                        color: theme.textPrimary,
                        borderColor: theme.border,
                        backgroundColor: theme.surface,
                      },
                    ]}
                    value={startStrings[idx] ?? String(note.time)}
                    onChangeText={(text) => {
                      const updated = [...startStrings];
                      updated[idx] = text;
                      setStartStrings(updated);

                      const parsed = parseFloat(text);
                      if (!isNaN(parsed)) {
                        const n = editingRow!.notes[idx];
                        const endTime = n.time + n.duration;
                        const updatedNotes = [...editingRow!.notes];
                        updatedNotes[idx] = {
                          ...updatedNotes[idx],
                          time: parsed,
                          duration: endTime - parsed,
                        };
                        setEditingRow({
                          ...editingRow!,
                          notes: updatedNotes,
                        });
                      }
                    }}
                    placeholder="0.00"
                    placeholderTextColor={theme.textDisabled}
                    keyboardType="decimal-pad"
                  />
                  <Text
                    style={{
                      color: theme.textSecondary,
                      fontSize: FontSize.md,
                    }}
                  >
                    →
                  </Text>
                  <TextInput
                    style={[
                      styles.timeInput,
                      {
                        color: theme.textPrimary,
                        borderColor: theme.border,
                        backgroundColor: theme.surface,
                      },
                    ]}
                    value={endStrings[idx] ?? String(note.time + note.duration)}
                    onChangeText={(text) => {
                      const updated = [...endStrings];
                      updated[idx] = text;
                      setEndStrings(updated);

                      const parsed = parseFloat(text);
                      if (!isNaN(parsed)) {
                        const n = editingRow!.notes[idx];
                        const updatedNotes = [...editingRow!.notes];
                        updatedNotes[idx] = {
                          ...updatedNotes[idx],
                          duration: parsed - n.time,
                        };
                        setEditingRow({
                          ...editingRow!,
                          notes: updatedNotes,
                        });
                      }
                    }}
                    placeholder="0.00"
                    placeholderTextColor={theme.textDisabled}
                    keyboardType="decimal-pad"
                  />
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: theme.border }]}
                onPress={() => setEditingRow(null)}
              >
                <Text style={{ color: theme.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                onPress={() => {
                  if (!editingRow) return;
                  const allNotes = [...notes];
                  const start = editingRow.rowIndex * NOTES_PER_ROW;
                  editingRow.notes.forEach((n, i) => {
                    allNotes[start + i] = n;
                  });
                  onNotesEdit(allNotes);
                  setEditingRow(null);
                }}
              >
                <Text
                  style={{
                    color: theme.textOnPrimary,
                    fontWeight: '700',
                  }}
                >
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function arePropsEqual(p: NotationContainerProps, n: NotationContainerProps) {
  return (
    p.notes === n.notes &&
    p.isLandscape === n.isLandscape &&
    p.isTutor === n.isTutor
  );
}

export const NotationContainer = memo(NotationContainerInner, arePropsEqual);

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl ?? 48,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  rowLabel: {
    marginBottom: Spacing.sm,
  },
  noteEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5,
  },
  notePill: {
    width: 52,
    height: 40,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: Spacing.sm,
    fontSize: FontSize.md,
    textAlign: 'center',
  },
  noteInput: {
    width: 64,
    height: 40,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: Spacing.sm,
    fontSize: FontSize.md,
    textAlign: 'center',
  },
  timeInput: {
    width: 64,
    height: 40,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: Spacing.sm,
    fontSize: FontSize.md,
    textAlign: 'center',
  },
  modalBtns: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    alignItems: 'center',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
});
