/**
 * Lesson Player Screen — layout matches sign-in: safeAreaContainer → container → full-width content.
 * Uses expo-video for video playback (SDK 55+).
 */

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
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
import { Colors } from '@/src/constants/theme';
import { lessonPlayerStyles } from '@/src/styles/lessonPlayerStyles';


export default function LessonPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { lesson, loading, error } = useLesson(id);
  const { course } = useCourse(lesson?.course_id ?? undefined);
  const { isComplete, setComplete, setCompletionFromApi } = useProgressStore();

  const lessonIds = lesson
    ? (course?.lessons?.map((l) => l.id) ?? [lesson.id])
    : undefined;
  const currentLessonIndex =
    lesson && course?.lessons
      ? Math.max(0, course.lessons.findIndex((l) => l.id === lesson.id))
      : 0;

  const videoRef = useRef<VideoView>(null);
  const [isPlaying, setIsPlaying] = useState(false);
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

  // Create video player — updates when lesson.video_url changes
  const videoPlayer = useVideoPlayer(lesson?.video_url ?? null, (player) => {
    player.loop = false;
    player.timeUpdateEventInterval = 1; // emit timeUpdate every 1 second
  });

  // Subscribe to player events
  useEffect(() => {
    const sub1 = videoPlayer.addListener('playingChange', (e) => {
      setIsPlaying(e.isPlaying);
    });
    const sub2 = videoPlayer.addListener('timeUpdate', (e) => {
      setPositionMs(Math.round(e.currentTime * 1000));
      setDurationMs(Math.round(videoPlayer.duration * 1000));
    });
    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, [videoPlayer]);

  // Load completion state from API when lesson loads
  useEffect(() => {
    if (!user || !lesson?.id) return;
    getLessonProgress(lesson.id).then((p) => {
      if (p) setCompletionFromApi(lesson.id, p.status === 'completed');
    });
  }, [lesson?.id, user, setCompletionFromApi]);

  // Sync notationMode when lesson loads with a different instrument
  useEffect(() => {
    if (lesson && modes.length > 0 && !modes.includes(notationMode)) {
      setNotationMode(defaultMode);
    }
  }, [lesson, defaultMode, modes, notationMode]);

  const progressRef = useRef({ positionMs: 0, durationMs: 0 });
  progressRef.current = { positionMs, durationMs };

  const { notes, loading: notationLoading, error: notationError } = useNotation(lesson?.notation_url ?? null);

  // Auto-check when video reaches end
  useEffect(() => {
    if (!user || !lesson || lessonComplete || durationMs <= 0) return;
    if (positionMs >= durationMs - 500) {
      setComplete(lesson.id, true);
      void saveProgress({
        lesson_id: lesson.id,
        course_id: lesson.course_id ?? null,
        watch_percent: 100,
        last_position_seconds: Math.floor(durationMs / 1000),
      });
    }
  }, [user, lesson, lessonComplete, positionMs, durationMs, setComplete]);

  function formatTime(ms: number) {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

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
    } catch {
      // Progress save is best-effort
    }
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

  useEffect(() => {
    return () => {
      void handleSaveProgress();
    };
  }, [handleSaveProgress]);

  if (loading) {
    return (
      <ScreenGradient style={lessonPlayerStyles.safeAreaContainer}>
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
          <View style={lessonPlayerStyles.container}>
            <View style={lessonPlayerStyles.center}>
              <Text style={lessonPlayerStyles.mutedText}>Loading...</Text>
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
              <Text style={lessonPlayerStyles.errorText}>
                {error ?? 'Lesson not found'}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </ScreenGradient>
    );
  }

  const displayDuration = lesson.duration_seconds
    ? formatTime(lesson.duration_seconds * 1000)
    : durationMs > 0
      ? formatTime(durationMs)
      : '';

  const plugin = getPlugin(lesson.instrument_slug ?? '');
  const showTopVideo = !(
    notationMode === 'sargam' &&
    notes.length > 0 &&
    plugin !== null
  );

  return (
    <ScreenGradient style={lessonPlayerStyles.safeAreaContainer}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={lessonPlayerStyles.container}>
          <View style={lessonPlayerStyles.header}>
            <View style={lessonPlayerStyles.lessonTitleRow}>
              <Text
                style={[lessonPlayerStyles.videoTitle, lessonPlayerStyles.lessonTitleFlex, { textAlign: 'left' }]}
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
          </View>

          <ScrollView
            style={lessonPlayerStyles.scroll}
            contentContainerStyle={lessonPlayerStyles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {showTopVideo && (
              <View style={lessonPlayerStyles.videoCard}>
                {lesson.video_url ? (
                  <VideoView
                    ref={videoRef}
                    player={videoPlayer}
                    style={lessonPlayerStyles.video}
                    contentFit="contain"
                    nativeControls={false}
                  />
                ) : (
                  <View style={lessonPlayerStyles.videoPlaceholder} />
                )}

                <TouchableOpacity
                  style={lessonPlayerStyles.playOverlay}
                  onPress={() => {
                    if (isPlaying) {
                      videoPlayer.pause();
                    } else {
                      videoPlayer.play();
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <View style={lessonPlayerStyles.playCircle}>
                    <Text style={lessonPlayerStyles.playIcon}>
                      {isPlaying ? '⏸' : '▶'}
                    </Text>
                  </View>
                </TouchableOpacity>

                <View style={lessonPlayerStyles.videoInfo}>
                  {displayDuration !== '' && (
                    <Text style={lessonPlayerStyles.videoDuration}>
                      {displayDuration}
                    </Text>
                  )}
                </View>
              </View>
            )}

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
                        notationMode === mode &&
                          lessonPlayerStyles.toggleOptionTextActive,
                      ]}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {notationMode === 'sargam' && (
              notationLoading ? (
                <View style={lessonPlayerStyles.staffPlaceholder}>
                  <ActivityIndicator size="small" color={Colors.textSecondary} />
                </View>
              ) : notationError ? (
                <View style={lessonPlayerStyles.staffPlaceholder}>
                  <Text style={lessonPlayerStyles.mutedText}>
                    Could not load notation: {notationError}
                  </Text>
                </View>
              ) : !lesson?.notation_url ? (
                <View style={lessonPlayerStyles.staffPlaceholder}>
                  <Text style={lessonPlayerStyles.mutedText}>
                    No notation available for this lesson
                  </Text>
                </View>
              ) : notes.length === 0 ? (
                <View style={lessonPlayerStyles.staffPlaceholder}>
                  <Text style={lessonPlayerStyles.mutedText}>
                    No notation sections in this lesson
                  </Text>
                </View>
              ) : (() => {
                if (!plugin) {
                  return (
                    <View style={lessonPlayerStyles.staffPlaceholder}>
                      <Text style={lessonPlayerStyles.mutedText}>
                        No player available for {lesson.instrument_slug}
                      </Text>
                    </View>
                  );
                }
                const { PlayerScreen } = plugin;
                return (
                  <PlayerScreen
                    lesson={lesson}
                    notes={notes}
                    onComplete={() => {}}
                    onProgress={() => {}}
                    lessonIds={lessonIds}
                    currentLessonIndex={currentLessonIndex}
                  />
                );
              })()
            )}

            {(notationMode === 'staff' || notationMode === 'tabs' ||
              notationMode === 'chords' || notationMode === 'bols') && (
              <View style={lessonPlayerStyles.staffPlaceholder}>
                <Text style={lessonPlayerStyles.mutedText}>
                  {notationMode.charAt(0).toUpperCase() + notationMode.slice(1)} notation coming soon
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </ScreenGradient>
  );
}
