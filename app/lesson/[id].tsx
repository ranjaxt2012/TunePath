/**
 * Lesson Player Screen
 * Landscape allowed. VideoPlayer memo prevents notation re-renders from re-rendering video.
 */

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Spacing, FontSize } from '@/src/design';
import { CompleteCheckbox } from '@/src/components/common/CompleteCheckbox';
import { ScreenGradient } from '@/src/components/common/ScreenGradient';
import type { NotationMode } from '@/src/types/models';
import { useCourse } from '@/src/hooks/useCourse';
import { useLesson } from '@/src/hooks/useLesson';
import { useNotation } from '@/src/hooks/useNotation';
import { getPlugin } from '@/src/registry/instrumentRegistry';
import { getLessonProgress, saveProgress } from '@/src/services/apiClient';
import { useAuthStore } from '@/src/store/authStore';
import { useProgressStore } from '@/src/store/progressStore';
import { lessonPlayerStyles } from '@/src/styles/lessonPlayerStyles';

export default function LessonPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const { lesson, loading, error } = useLesson(id);
  const { course } = useCourse(lesson?.course_id ?? undefined);
  const {
    isComplete,
    setComplete,
    setCompletionFromApi,
    isFavorite,
    toggleFavorite,
    savePosition,
    getPosition,
    markComplete,
  } = useProgressStore();

  // Allow landscape on lesson screen
  useEffect(() => {
    void ScreenOrientation.unlockAsync();
    return () => {
      void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  const lessonIds = lesson
    ? (course?.lessons?.map((l) => l.id) ?? [lesson.id])
    : undefined;
  const currentLessonIndex =
    lesson && course?.lessons
      ? Math.max(0, course.lessons.findIndex((l) => l.id === lesson.id))
      : 0;

  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [completeLoading, setCompleteLoading] = useState(false);

  const modes = useMemo(
    () => (lesson?.instrument_notation_modes ?? ['sargam']) as NotationMode[],
    [lesson?.instrument_notation_modes]
  );
  const defaultMode = modes[0] ?? 'sargam';
  const [notationMode, setNotationMode] = useState<NotationMode>(defaultMode);

  const lessonComplete = lesson ? isComplete(lesson.id) : false;
  const lessonFavorited = lesson ? isFavorite(lesson.id) : false;

  // Load completion from API
  useEffect(() => {
    if (!user || !lesson?.id) return;
    getLessonProgress(lesson.id).then((p) => {
      if (p) {
        setCompletionFromApi(lesson.id, p.status === 'completed');
        // Restore position
        if (p.last_position_seconds > 0) {
          savePosition(lesson.id, p.last_position_seconds);
        }
      }
    }).catch(() => {});
  }, [lesson?.id, user, setCompletionFromApi, savePosition]);

  useEffect(() => {
    if (lesson && modes.length > 0 && !modes.includes(notationMode)) {
      setNotationMode(defaultMode);
    }
  }, [lesson, defaultMode, modes, notationMode]);

  const progressRef = useRef({ positionMs: 0, durationMs: 0 });
  progressRef.current = { positionMs, durationMs };

  const { notes, loading: notationLoading, error: notationError } = useNotation(lesson?.notation_url ?? null);

  // Auto-complete at end
  useEffect(() => {
    if (!user || !lesson || lessonComplete || durationMs <= 0) return;
    if (positionMs >= durationMs - 500) {
      markComplete(lesson.id);
      void saveProgress({
        lesson_id: lesson.id,
        course_id: lesson.course_id ?? null,
        watch_percent: 100,
        last_position_seconds: Math.floor(durationMs / 1000),
      });
    }
  }, [user, lesson, lessonComplete, positionMs, durationMs, markComplete]);

  const handleSaveProgress = useCallback(async (completed = false) => {
    if (!user || !lesson) return;
    const { positionMs: pos, durationMs: dur } = progressRef.current;
    const watchPercent = dur > 0 ? Math.round((pos / dur) * 100) : 0;
    try {
      await saveProgress({
        lesson_id: lesson.id,
        course_id: lesson.course_id ?? null,
        watch_percent: completed ? 100 : watchPercent,
        last_position_seconds: Math.floor(pos / 1000),
      });
    } catch { /* best-effort */ }
  }, [user, lesson]);

  const handleCompleteToggle = useCallback(async () => {
    if (!user || !lesson) return;
    const nextComplete = !lessonComplete;
    const prevComplete = lessonComplete;
    setComplete(lesson.id, nextComplete);
    setCompleteLoading(true);
    const { positionMs: pos, durationMs: dur } = progressRef.current;
    const watchPercent = dur > 0 ? Math.round((pos / dur) * 100) : 0;
    try {
      await saveProgress({
        lesson_id: lesson.id,
        course_id: lesson.course_id ?? null,
        watch_percent: nextComplete ? 100 : watchPercent,
        last_position_seconds: Math.floor(pos / 1000),
      });
    } catch {
      setComplete(lesson.id, prevComplete);
      Alert.alert('Error', 'Could not update completion. Please try again.');
    } finally {
      setCompleteLoading(false);
    }
  }, [user, lesson, lessonComplete, setComplete]);

  const handleFavoriteToggle = useCallback(() => {
    if (!lesson) return;
    toggleFavorite(lesson.id);
  }, [lesson, toggleFavorite]);

  useEffect(() => {
    return () => { void handleSaveProgress(); };
  }, [handleSaveProgress]);

  if (loading) {
    return (
      <ScreenGradient style={lessonPlayerStyles.safeAreaContainer}>
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
          <View style={lessonPlayerStyles.container}>
            <View style={lessonPlayerStyles.center}>
              <ActivityIndicator color={theme.primary} />
            </View>
          </View>
        </SafeAreaView>
      </ScreenGradient>
    );
  }

  if (error || !lesson) {
    return (
      <ScreenGradient style={lessonPlayerStyles.safeAreaContainer}>
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
          <View style={lessonPlayerStyles.container}>
            <View style={lessonPlayerStyles.center}>
              <Text style={lessonPlayerStyles.errorText}>{error ?? 'Lesson not found'}</Text>
            </View>
          </View>
        </SafeAreaView>
      </ScreenGradient>
    );
  }

  const plugin = getPlugin(lesson.instrument_slug ?? '');

  return (
    <ScreenGradient style={lessonPlayerStyles.safeAreaContainer}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={lessonPlayerStyles.container}>
          {/* Header */}
          <View style={lessonPlayerStyles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={theme.textPrimary} />
            </TouchableOpacity>
            <Text
              style={[lessonPlayerStyles.videoTitle, lessonPlayerStyles.lessonTitleFlex, { color: theme.textPrimary }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {lesson.title}
            </Text>
            <View style={lessonPlayerStyles.checkboxWrap}>
              <CompleteCheckbox
                isComplete={lessonComplete}
                onToggle={handleCompleteToggle}
                loading={completeLoading}
                compact
              />
            </View>
          </View>

          {/* Notation mode picker */}
          {modes.length > 1 && (
            <View style={lessonPlayerStyles.toggleContainer}>
              {modes.map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    lessonPlayerStyles.toggleOption,
                    notationMode === mode && lessonPlayerStyles.toggleOptionActive,
                  ]}
                  onPress={() => setNotationMode(mode)}
                >
                  <Text
                    style={[
                      lessonPlayerStyles.toggleOptionText,
                      notationMode === mode && lessonPlayerStyles.toggleOptionTextActive,
                    ]}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Player */}
          {notationMode === 'sargam' && (
            notationLoading ? (
              <View style={lessonPlayerStyles.staffPlaceholder}>
                <ActivityIndicator size="small" color={theme.textSecondary} />
              </View>
            ) : notationError ? (
              <View style={lessonPlayerStyles.staffPlaceholder}>
                <Text style={lessonPlayerStyles.mutedText}>Could not load notation</Text>
              </View>
            ) : !plugin ? (
              <View style={lessonPlayerStyles.staffPlaceholder}>
                <Text style={lessonPlayerStyles.mutedText}>
                  No player for {lesson.instrument_slug}
                </Text>
              </View>
            ) : (
              <plugin.PlayerScreen
                lesson={lesson}
                notes={notes}
                onComplete={() => markComplete(lesson.id)}
                onProgress={() => {}}
                lessonIds={lessonIds}
                currentLessonIndex={currentLessonIndex}
              />
            )
          )}

          {(notationMode === 'staff' || notationMode === 'tabs' ||
            notationMode === 'chords' || notationMode === 'bols') && (
            <View style={lessonPlayerStyles.staffPlaceholder}>
              <Text style={lessonPlayerStyles.mutedText}>
                {notationMode.charAt(0).toUpperCase() + notationMode.slice(1)} notation coming soon
              </Text>
            </View>
          )}

          {/* Action bar */}
          <View style={[styles.actionBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleFavoriteToggle}>
              <Ionicons
                name={lessonFavorited ? 'heart' : 'heart-outline'}
                size={22}
                color={lessonFavorited ? '#EF4444' : theme.textSecondary}
              />
              <Text style={[styles.actionLabel, { color: theme.textSecondary }]}>Like</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleFavoriteToggle}>
              <Ionicons name="bookmark-outline" size={22} color={theme.textSecondary} />
              <Text style={[styles.actionLabel, { color: theme.textSecondary }]}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="share-outline" size={22} color={theme.textSecondary} />
              <Text style={[styles.actionLabel, { color: theme.textSecondary }]}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="person-outline" size={22} color={theme.textSecondary} />
              <Text style={[styles.actionLabel, { color: theme.textSecondary }]}>Follow</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  actionBar: {
    flexDirection: 'row',
    height: 52,
    borderTopWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  actionLabel: {
    fontSize: FontSize.xs,
  },
});
