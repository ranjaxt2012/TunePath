import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  PanResponder,
  StyleSheet,
} from 'react-native';
import { useTheme, Spacing, FontSize, Radius } from '@/src/design';
import type { Note } from '@/src/hooks/useLesson';

interface NoteTimingEditorProps {
  visible: boolean;
  note: Note | null;
  noteIndex: number;
  totalNotes: number;
  videoDuration: number;
  onSave(note: Note): void;
  onClose(): void;
  onPrev(): void;
  onNext(): void;
}

const TIMELINE_WIDTH = 300;
const HANDLE_SIZE = 28;

export function NoteTimingEditor({
  visible,
  note,
  noteIndex,
  totalNotes,
  videoDuration,
  onSave,
  onClose,
  onPrev,
  onNext,
}: NoteTimingEditorProps) {
  const { theme } = useTheme();

  const [startTime, setStartTime] = useState(note?.time ?? 0);
  const [endTime, setEndTime] = useState(
    note ? note.time + note.duration : 1
  );

  const startTimeRef = useRef(startTime);
  const endTimeRef = useRef(endTime);
  useEffect(() => {
    startTimeRef.current = startTime;
    endTimeRef.current = endTime;
  }, [startTime, endTime]);

  useEffect(() => {
    if (note) {
      setStartTime(note.time);
      setEndTime(note.time + note.duration);
    }
  }, [note?.time, noteIndex]);

  const duration = videoDuration || 30;

  const timeToX = (t: number) => (t / duration) * TIMELINE_WIDTH;
  const xToTime = (x: number) =>
    Math.max(
      0,
      Math.min(duration, (x / TIMELINE_WIDTH) * duration)
    );
  const round = (n: number) => Math.round(n * 1000) / 1000;

  const startPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        const newTime = xToTime(
          timeToX(startTimeRef.current) + g.dx
        );
        if (newTime < endTimeRef.current - 0.1) {
          setStartTime(round(newTime));
        }
      },
    })
  ).current;

  const endPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        const newTime = xToTime(
          timeToX(endTimeRef.current) + g.dx
        );
        if (newTime > startTimeRef.current + 0.1) {
          setEndTime(round(newTime));
        }
      },
    })
  ).current;

  const handleSave = () => {
    if (!note) return;
    onSave({
      ...note,
      time: startTime,
      duration: endTime - startTime,
    });
  };

  if (!note) return null;

  const startX = timeToX(startTime);
  const endX = timeToX(endTime);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: theme.modalBg }]}>
          <View
            style={[styles.handle, { backgroundColor: theme.border }]}
          />

          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {note.note}
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: FontSize.sm,
                fontWeight: '400',
              }}
            >
              {'  '}
              {noteIndex + 1} of {totalNotes}
            </Text>
          </Text>

          <View style={styles.timelineWrap}>
            <View
              style={[styles.track, { backgroundColor: theme.surface }]}
            >
              <View
                style={[
                  styles.activeRegion,
                  {
                    backgroundColor: theme.primary + '40',
                    borderColor: theme.primary,
                    left: startX,
                    width: endX - startX,
                  },
                ]}
              />

              <View
                style={[
                  styles.handle_start,
                  {
                    backgroundColor: theme.success,
                    left: startX - HANDLE_SIZE / 2,
                  },
                ]}
                {...startPan.panHandlers}
              >
                <Text style={styles.handleLabel}>◀</Text>
              </View>

              <View
                style={[
                  styles.handle_end,
                  {
                    backgroundColor: '#EF4444',
                    left: endX - HANDLE_SIZE / 2,
                  },
                ]}
                {...endPan.panHandlers}
              >
                <Text style={styles.handleLabel}>▶</Text>
              </View>
            </View>

            <View style={styles.timeLabels}>
              <Text
                style={[styles.timeLabel, { color: theme.success }]}
              >
                Start: {startTime.toFixed(3)}s
              </Text>
              <Text
                style={[styles.timeLabel, { color: '#EF4444' }]}
              >
                End: {endTime.toFixed(3)}s
              </Text>
            </View>

            <Text
              style={[
                styles.duration,
                { color: theme.textSecondary },
              ]}
            >
              Duration: {(endTime - startTime).toFixed(3)}s
            </Text>
          </View>

          <View style={styles.navRow}>
            <TouchableOpacity
              onPress={onPrev}
              disabled={noteIndex === 0}
              style={[
                styles.navBtn,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  opacity: noteIndex === 0 ? 0.4 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: FontSize.sm,
                }}
              >
                ◀ Prev
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              style={[
                styles.saveBtn,
                { backgroundColor: theme.primary },
              ]}
            >
              <Text
                style={{
                  color: theme.textOnPrimary,
                  fontWeight: '700',
                  fontSize: FontSize.md,
                }}
              >
                Save ✓
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onNext}
              disabled={noteIndex === totalNotes - 1}
              style={[
                styles.navBtn,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  opacity: noteIndex === totalNotes - 1 ? 0.4 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: FontSize.sm,
                }}
              >
                Next ▶
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: FontSize.sm,
              }}
            >
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  timelineWrap: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  track: {
    width: TIMELINE_WIDTH,
    height: 48,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    overflow: 'visible' as const,
    position: 'relative' as const,
  },
  activeRegion: {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    borderWidth: 1.5,
    borderRadius: Radius.sm,
  },
  handle_start: {
    position: 'absolute' as const,
    top: 10,
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle_end: {
    position: 'absolute' as const,
    top: 10,
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: TIMELINE_WIDTH,
    marginBottom: Spacing.xs,
  },
  timeLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  duration: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
  },
  navRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  navBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  closeBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
});
