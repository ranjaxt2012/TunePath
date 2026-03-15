/**
 * Lesson Player Screen — layout matches sign-in: safeAreaContainer → container → full-width content.
 * expo-av is lazy-loaded to avoid crash when ExponentAV native module is unavailable.
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CompleteCheckbox } from '@/src/components/common/CompleteCheckbox';
import { ScreenGradient } from '@/src/components/common/ScreenGradient';
import type { NotationMode } from '@/src/types/models';
import { useLesson } from '@/src/hooks/useLesson';
import { useNotation } from '@/src/hooks/useNotation';
import { HarmoniumPlayer } from '@/instruments/harmonium/HarmoniumPlayer';
import { getLessonProgress, saveProgress } from '@/src/services/apiClient';
import { useAuthStore } from '@/src/store/authStore';
import { useProgressStore } from '@/src/store/progressStore';
import { Colors } from '@/src/constants/theme';
import { lessonPlayerStyles } from '@/src/styles/lessonPlayerStyles';

let _expoAV: typeof import('expo-av') | null | 'uninit' = 'uninit';
let _expoAVFailed = false;

function getExpoAV(): typeof import('expo-av') | null {
  // Only load expo-av in Standalone builds — Expo Go and Bare lack ExponentAV in some setups
  if (Platform.OS === 'web') return null;
  if (Constants.executionEnvironment !== ExecutionEnvironment.Standalone) return null;
  if (_expoAVFailed) return null;
  if (_expoAV === 'uninit') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      _expoAV = require('expo-av');
    } catch {
      _expoAVFailed = true;
      _expoAV = null;
    }
  }
  return _expoAV === 'uninit' ? null : _expoAV;
}


export default function LessonPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { lesson, loading, error } = useLesson(id);
  const { isComplete, setComplete, setCompletionFromApi } = useProgressStore();

  const videoRef = useRef<unknown>(null);
  const [status, setStatus] = useState<import('expo-av').AVPlaybackStatus | null>(null);
  const [completeLoading, setCompleteLoading] = useState(false);
  const modes = (lesson?.instrument_notation_modes ?? ['sargam']) as NotationMode[];
  const defaultMode = modes[0] ?? 'sargam';
  const [notationMode, setNotationMode] = useState<NotationMode>(defaultMode);

  const lessonComplete = lesson ? isComplete(lesson.id) : false;

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
  }, [lesson?.id, defaultMode, modes, notationMode]);

  const progressRef = useRef({ positionMs: 0, durationMs: 0 });
  const isPlaying = status?.isLoaded ? status.isPlaying : false;
  const positionMs = status?.isLoaded ? status.positionMillis ?? 0 : 0;
  const durationMs = status?.isLoaded ? status.durationMillis ?? 0 : 0;
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
            <TouchableOpacity
              style={lessonPlayerStyles.backBtn}
              onPress={() => router.back()}
            >
              <Text style={lessonPlayerStyles.backText}>← Back</Text>
            </TouchableOpacity>
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
            <TouchableOpacity
              style={lessonPlayerStyles.backBtn}
              onPress={() => router.back()}
            >
              <Text style={lessonPlayerStyles.backText}>← Back</Text>
            </TouchableOpacity>
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

  return (
    <ScreenGradient style={lessonPlayerStyles.safeAreaContainer}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={lessonPlayerStyles.container}>
          <View style={lessonPlayerStyles.header}>
            <TouchableOpacity
              style={lessonPlayerStyles.backBtn}
              onPress={() => router.back()}
            >
              <Text style={lessonPlayerStyles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={lessonPlayerStyles.headerMeta}>
              {lesson.instrument_slug
                ? lesson.instrument_slug.charAt(0).toUpperCase() +
                  lesson.instrument_slug.slice(1)
                : 'Lesson'}
              {' • Beginner'}
            </Text>
            <View style={lessonPlayerStyles.lessonTitleRow}>
              <Text
                style={[lessonPlayerStyles.lessonTitle, lessonPlayerStyles.lessonTitleFlex]}
                numberOfLines={1}
                adjustsFontSizeToFit
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
            <View style={lessonPlayerStyles.videoCard}>
              {(() => {
                const av = getExpoAV();
                const VideoComponent = av?.Video;
                return lesson.video_url && VideoComponent ? (
                  <VideoComponent
                    ref={videoRef as never}
                    source={{ uri: lesson.video_url }}
                    style={lessonPlayerStyles.video}
                    resizeMode={av.ResizeMode.CONTAIN}
                    useNativeControls={false}
                    onPlaybackStatusUpdate={setStatus}
                    shouldPlay={false}
                  />
                ) : (
                  <View style={lessonPlayerStyles.videoPlaceholder} />
                );
              })()}

              <TouchableOpacity
                style={lessonPlayerStyles.playOverlay}
                onPress={async () => {
                  const v = videoRef.current as { playAsync?: () => Promise<void>; pauseAsync?: () => Promise<void> } | null;
                  if (!v?.playAsync || !v?.pauseAsync) return;
                  if (isPlaying) {
                    await v.pauseAsync();
                  } else {
                    await v.playAsync();
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
                <Text style={lessonPlayerStyles.videoTitle} numberOfLines={1}>
                  {lesson.title}
                </Text>
                {displayDuration !== '' && (
                  <Text style={lessonPlayerStyles.videoDuration}>
                    {displayDuration}
                  </Text>
                )}
              </View>
            </View>

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
              ) : (
                <HarmoniumPlayer
                  lesson={lesson}
                  notes={notes}
                  onComplete={() => {}}
                  onProgress={() => {}}
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
          </ScrollView>
        </View>
      </SafeAreaView>
    </ScreenGradient>
  );
}
