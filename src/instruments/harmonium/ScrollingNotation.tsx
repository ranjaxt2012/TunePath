/**
 * ScrollingNotation — karaoke-style notation panel.
 * All notes visible upfront. Completed lines vanish (slide up + fade).
 * Active note highlighted; next line dim preview. ScrollView with auto-scroll.
 */

import { useTheme } from '@/src/contexts/ThemeContext';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
  Easing,
  LayoutChangeEvent,
  Modal,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontSize, Radius, Spacing, Typography } from '@/src/constants/theme';
import { chunkNotes } from '@/src/utils/notation';
import type { Note } from '@/src/utils/notation';

const LINE_HEIGHT_PORTRAIT = 56;
const LINE_HEIGHT_LANDSCAPE = 44;
const NOTES_PER_LINE = 4;

const SARGAM_NOTES = ['Sa', 'Re', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni'];

type ScrollingNotationProps = {
  notes: Note[];
  activeNoteIndex: number;
  noteProgress: number; // 0.0 → 1.0 through current note
  isTutor?: boolean;
  onNotesEdit?: (notes: Note[]) => void;
  isLandscape?: boolean;
};

export function ScrollingNotation({
  notes,
  activeNoteIndex,
  noteProgress,
  isTutor = false,
  onNotesEdit,
  isLandscape = false,
}: ScrollingNotationProps) {
  const { theme } = useTheme();
  const [panelHeight, setPanelHeight] = useState(300);
  const [dismissed, setDismissed] = useState<Set<number>>(() => new Set());
  const [editingLine, setEditingLine] = useState<number | null>(null);
  const [editingNotes, setEditingNotes] = useState<Note[]>([]);
  const [saveToast, setSaveToast] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const lineHeight = isLandscape ? LINE_HEIGHT_LANDSCAPE : LINE_HEIGHT_PORTRAIT;

  const lines = React.useMemo(() => chunkNotes(notes, NOTES_PER_LINE), [notes]);
  const headerLine = lines[0];
  const scrollLines = lines.slice(1);
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
    const scrollActiveLine = Math.max(0, activeLine - 1);
    const y = Math.max(0, scrollActiveLine * lineHeight - panelHeight * 0.3);
    scrollRef.current?.scrollTo({ y, animated: activeNoteIndex > -1 });
  }, [activeNoteIndex, activeLine, panelHeight, lineHeight]);

  const prevActiveIndexRef = useRef(activeNoteIndex);
  useEffect(() => {
    const prev = prevActiveIndexRef.current;
    prevActiveIndexRef.current = activeNoteIndex;
    if (activeNoteIndex < 0 || activeNoteIndex >= prev) return;
    const currentActiveLine = Math.floor(activeNoteIndex / NOTES_PER_LINE);
    setDismissed((prevSet) => {
      const next = new Set(prevSet);
      [...next].forEach((lineIndex) => {
        if (lineIndex >= currentActiveLine - 1) next.delete(lineIndex);
      });
      return next;
    });
  }, [activeNoteIndex]);

  const handleDismiss = useCallback((lineIndex: number) => {
    setDismissed((prev) => new Set(prev).add(lineIndex));
  }, []);

  const handleEditLine = useCallback((lineIndex: number) => {
    setEditingLine(lineIndex);
    setEditingNotes([...notes]);
  }, [notes]);

  const handleSaveLine = useCallback(() => {
    const lineIdx = editingLine ?? 0;
    const start = lineIdx * NOTES_PER_LINE;
    const end = start + NOTES_PER_LINE;
    const lineNotes = [...editingNotes.slice(start, end)].sort((a, b) => a.time - b.time);
    const sorted = [
      ...editingNotes.slice(0, start),
      ...lineNotes,
      ...editingNotes.slice(end),
    ];
    setEditingLine(null);
    onNotesEdit?.(sorted);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  }, [editingLine, editingNotes, onNotesEdit]);

  return (
    <View
      style={styles.panel}
      onLayout={onPanelLayout}
      pointerEvents="box-none"
    >
      {headerLine !== undefined && !dismissed.has(0) && (
        <NotationLine
            key={0}
            lineIndex={0}
            line={headerLine}
            activeNoteInLine={activeNoteInLine}
            activeNoteOpacity={activeNoteOpacity}
            nextNoteOpacity={nextNoteOpacity}
            nextNoteScale={nextNoteScale}
            noteProgress={noteProgress}
            isCompleted={activeLine >= 2}
            isPreviousLine={activeLine === 1}
            isActiveLine={activeLine === 0}
            isNextLine={false}
            isFuture={false}
            onDismiss={handleDismiss}
            isTutor={isTutor}
            onEditLine={handleEditLine}
            isLandscape={isLandscape}
            lineHeight={lineHeight}
            theme={theme}
          />
      )}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {scrollLines.map((line, lineIdx) => {
          const originalLineIdx = lineIdx + 1;
          const inWindow =
            activeLine >= 0
              ? originalLineIdx >= activeLine - 1 && originalLineIdx <= activeLine + 1
              : originalLineIdx <= 2;
          const animatingOut = originalLineIdx < activeLine - 1 && !dismissed.has(originalLineIdx);
          if (!inWindow && !animatingOut) return null;
          const isCompleted = originalLineIdx < activeLine - 1;
          const isPreviousLine = originalLineIdx === activeLine - 1;
          const isActiveLine = originalLineIdx === activeLine;
          const isNextLine = originalLineIdx === activeLine + 1;
          const isFuture = originalLineIdx > activeLine + 1;
          return (
            <NotationLine
              key={originalLineIdx}
              lineIndex={originalLineIdx}
              line={line}
              activeNoteInLine={activeNoteInLine}
              activeNoteOpacity={activeNoteOpacity}
              nextNoteOpacity={nextNoteOpacity}
              nextNoteScale={nextNoteScale}
              noteProgress={noteProgress}
              isCompleted={isCompleted}
              isPreviousLine={isPreviousLine}
              isActiveLine={isActiveLine}
              isNextLine={isNextLine}
              isFuture={isFuture}
              onDismiss={handleDismiss}
              isTutor={isTutor}
              onEditLine={handleEditLine}
              isLandscape={isLandscape}
              lineHeight={lineHeight}
              theme={theme}
            />
          );
        })}
      </ScrollView>

      <Modal
        visible={editingLine !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingLine(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Edit Line {(editingLine ?? 0) + 1}
              </Text>
              <TouchableOpacity onPress={() => setEditingLine(null)}>
                <Ionicons
                  name="close"
                  size={20}
                  color={'#FFFFFF'}
                />
              </TouchableOpacity>
            </View>

            {editingLine !== null &&
              editingNotes
                .slice(
                  editingLine * NOTES_PER_LINE,
                  (editingLine + 1) * NOTES_PER_LINE,
                )
                .map((note, i) => {
                  const noteIdx = editingLine * NOTES_PER_LINE + i;
                  return (
                    <View key={noteIdx} style={styles.editRow}>
                      <Text style={styles.editLabel}>Note {i + 1}</Text>
                      <NotePickerDropdown
                        value={note.note}
                        onChange={(newNote) => {
                          const updated = [...editingNotes];
                          updated[noteIdx] = { ...updated[noteIdx], note: newNote };
                          setEditingNotes(updated);
                        }}
                        theme={theme}
                      />
                      <Text style={styles.editLabel}>Time</Text>
                      <TextInput
                        style={styles.timeInput}
                        value={String(
                          Math.round(note.time * 100) / 100,
                        )}
                        onChangeText={(val) => {
                          const t = parseFloat(val);
                          if (Number.isNaN(t)) return;
                          const updated = [...editingNotes];
                          updated[noteIdx] = { ...updated[noteIdx], time: t };
                          setEditingNotes(updated);
                        }}
                        keyboardType="decimal-pad"
                        selectTextOnFocus
                      />
                      <Text style={styles.editLabel}>s</Text>
                    </View>
                  );
                })}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditingLine(null)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: theme.bgPrimary }]}
                onPress={handleSaveLine}
              >
                <Text style={styles.saveText}>Save Line</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {saveToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✅ Line saved</Text>
        </View>
      )}
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
  noteProgress: number;
  isCompleted: boolean;
  isPreviousLine: boolean;
  isActiveLine: boolean;
  isNextLine: boolean;
  isFuture: boolean;
  onDismiss: (lineIndex: number) => void;
  isTutor?: boolean;
  onEditLine?: (lineIndex: number) => void;
  isLandscape: boolean;
  lineHeight: number;
  theme: ReturnType<typeof useTheme>['theme'];
};

const NotationLine = React.memo(function NotationLine({
  lineIndex,
  line,
  activeNoteInLine,
  activeNoteOpacity,
  nextNoteOpacity,
  nextNoteScale,
  noteProgress,
  isCompleted,
  isPreviousLine,
  isActiveLine,
  isNextLine,
  isFuture,
  onDismiss,
  isTutor = false,
  onEditLine,
  isLandscape,
  lineHeight,
  theme,
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
        duration: 250,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start(() => onDismiss(lineIndex));
  }, [isCompleted, lineIndex, onDismiss, translateY, opacity]);

  const editButton = isTutor && onEditLine && (
    <TouchableOpacity
      onPress={() => onEditLine(lineIndex)}
      style={styles.editBtn}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons
        name="pencil"
        size={14}
        color="rgba(255,255,255,0.5)"
      />
    </TouchableOpacity>
  );

  const wrapRow = (content: React.ReactNode) =>
    isTutor ? (
      <View style={styles.lineRow}>
        <View style={styles.lineCells}>{content}</View>
        {editButton}
      </View>
    ) : (
      content
    );

  if (isCompleted) {
    return wrapRow(
      <Animated.View
        style={[
          styles.lineBase,
          { height: lineHeight },
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
      </Animated.View>,
    );
  }

  if (isPreviousLine) {
    const previousOpacity = 0.5 - noteProgress * 0.5;
    return wrapRow(
      <View style={[styles.lineBase, { height: lineHeight, opacity: previousOpacity }]}>
        {line.map((n, cellIdx) => (
          <View key={flatStart + cellIdx} style={styles.cell}>
            <Text style={styles.cellTextNext}>{n.note}</Text>
            {n.lyric ? <Text style={styles.cellLyric}>{n.lyric}</Text> : null}
          </View>
        ))}
      </View>,
    );
  }

  return wrapRow(
    <View
      style={[
        styles.lineBase,
        { height: lineHeight },
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
            isLandscape={isLandscape}
            theme={theme}
          />
        );
      })}
    </View>,
  );
}, (prev, next) => {
  // Always re-render active and previous lines (they animate / depend on noteProgress).
  if (prev.isActiveLine || next.isActiveLine) return false;
  if (prev.isPreviousLine || next.isPreviousLine) return false;

  // If completion state changes, we need to animate out.
  if (prev.isCompleted !== next.isCompleted) return false;

  // If this line changes from/to next/future window, re-render.
  if (prev.isNextLine !== next.isNextLine) return false;
  if (prev.isFuture !== next.isFuture) return false;

  // If tutor/edit toggles, re-render to show/hide pencil.
  if (prev.isTutor !== next.isTutor) return false;
  if (prev.onEditLine !== next.onEditLine) return false;

  // Landscape changes affect font sizes.
  if (prev.isLandscape !== next.isLandscape) return false;
  if (prev.lineHeight !== next.lineHeight) return false;

  // Otherwise skip.
  return true;
});

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
  isLandscape: boolean;
  theme: ReturnType<typeof useTheme>['theme'];
};

const NoteCell = React.memo(function NoteCell({
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
  isLandscape,
  theme,
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

  const mainFontSize = isLandscape
    ? (isActive ? FontSize.md : FontSize.sm)
    : (isActive ? FontSize.lg : FontSize.md);

  const renderContent = (mainStyle: object, lyricStyle: object = styles.cellLyric) => (
    <>
      <Text style={[mainStyle, { fontSize: mainFontSize }]}>{note}</Text>
      {lyric ? <Text style={lyricStyle}>{lyric}</Text> : null}
    </>
  );

  if (isActive) {
    return (
      <Animated.View
        style={[styles.cell, styles.cellActive, { transform: [{ scale: scaleAnim }] }]}
      >
        <View style={[styles.cellActiveInner, { opacity: activeNoteOpacity, backgroundColor: theme.bgPrimary }]}>
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
}, (prev, next) => {
  // Only re-render if the cell's state meaningfully changes.
  if (prev.isActive !== next.isActive) return false;
  if (prev.isNextNote !== next.isNextNote) return false;
  if (prev.isPastInLine !== next.isPastInLine) return false;
  if (prev.isFutureInLine !== next.isFutureInLine) return false;
  if (prev.isNextLine !== next.isNextLine) return false;
  if (prev.isFuture !== next.isFuture) return false;
  if (prev.isLandscape !== next.isLandscape) return false;
  if (prev.note !== next.note) return false;
  if (prev.lyric !== next.lyric) return false;

  // For active/next cells, allow small noteProgress jitter without rerendering.
  // Values outside this threshold will rerender to keep karaoke feel.
  if (next.isActive && Math.abs(prev.activeNoteOpacity - next.activeNoteOpacity) > 0.05) return false;
  if (next.isNextNote && (Math.abs(prev.nextNoteOpacity - next.nextNoteOpacity) > 0.05 || Math.abs(prev.nextNoteScale - next.nextNoteScale) > 0.02)) return false;

  return true;
});

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
    flex: 1,
    flexDirection: 'row',
    height: 56,
  },
  lineActive: {
    flexDirection: 'row',
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  lineNext: {
    flexDirection: 'row',
    height: 56,
    opacity: 0.35,
  },
  lineFuture: {
    flexDirection: 'row',
    height: 56,
    opacity: 0.2,
  },
  linePast: {
    flexDirection: 'row',
    height: 56,
    opacity: 0,
  },
  headerPast: {
    opacity: 0.35,
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
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  cellTextActive: {
    fontFamily: Typography.bold,
    fontSize: FontSize.lg,
    color: '#FFFFFF',
  },
  cellTextNext: {
    fontFamily: Typography.regular,
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.75)',
  },
  cellTextFuture: {
    fontFamily: Typography.regular,
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.75)',
  },
  cellTextPast: {
    fontFamily: Typography.regular,
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.75)',
    opacity: 0.2,
  },
  cellLyric: {
    fontFamily: Typography.regular,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.75)',
    opacity: 0.7,
    marginTop: 2,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
  },
  lineCells: {
    flex: 1,
    flexDirection: 'row',
  },
  editBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#2D1B69',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontFamily: Typography.semiBold,
    fontSize: FontSize.lg,
    color: '#FFFFFF',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  editLabel: {
    fontFamily: Typography.regular,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    width: 42,
  },
  timeInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    color: '#FFFFFF',
    fontFamily: Typography.medium,
    fontSize: FontSize.sm,
    width: 70,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: Typography.medium,
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.75)',
  },
  saveText: {
    fontFamily: Typography.semiBold,
    fontSize: FontSize.md,
    color: '#FFFFFF',
  },
  notePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: 4,
    minWidth: 52,
  },
  notePickerText: {
    fontFamily: Typography.medium,
    fontSize: FontSize.sm,
    color: '#FFFFFF',
  },
  noteDropdown: {
    position: 'absolute',
    top: 32,
    left: 0,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.md,
    zIndex: 999,
    overflow: 'hidden',
    minWidth: 70,
  },
  noteOption: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  noteOptionText: {
    fontFamily: Typography.regular,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.75)',
  },
  noteOptionTextActive: {
    fontFamily: Typography.medium,
    fontSize: FontSize.sm,
    color: '#FFFFFF',
  },
  toast: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    zIndex: 999,
    elevation: 5,
  },
  toastText: {
    fontFamily: Typography.semiBold,
    fontSize: FontSize.sm,
    color: '#FFFFFF',
  },
});

function NotePickerDropdown({
  value,
  onChange,
  theme,
}: {
  value: string;
  onChange: (note: string) => void;
  theme: ReturnType<typeof useTheme>['theme'];
}) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity
        style={styles.notePicker}
        onPress={() => setOpen(!open)}
      >
        <Text style={styles.notePickerText}>{value}</Text>
        <Ionicons
          name="chevron-down"
          size={12}
          color={'rgba(255,255,255,0.75)'}
        />
      </TouchableOpacity>
      {open && (
        <View style={styles.noteDropdown}>
          {SARGAM_NOTES.map((n) => (
            <TouchableOpacity
              key={n}
              style={[
                styles.noteOption,
                n === value && { backgroundColor: theme.bgPrimary },
              ]}
              onPress={() => {
                onChange(n);
                setOpen(false);
              }}
            >
              <Text
                style={[
                  styles.noteOptionText,
                  n === value && styles.noteOptionTextActive,
                ]}
              >
                {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
