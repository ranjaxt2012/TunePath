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
} from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenGradient } from '@/src/components/common/ScreenGradient';
import { useLesson } from '@/src/hooks/useLesson';
import { saveProgress } from '@/src/services/apiClient';
import { useAuthStore } from '@/src/store/authStore';
import { lessonPlayerStyles } from '@/src/styles/lessonPlayerStyles';

let _expoAV: typeof import('expo-av') | null | 'uninit' = 'uninit';
let _expoAVFailed = false;

function getExpoAV(): typeof import('expo-av') | null {
  // Only load expo-av in Standalone or Bare — Expo Go lacks ExponentAV native module
  const canUseExpoAV =
    Constants.executionEnvironment === ExecutionEnvironment.Standalone ||
    Constants.executionEnvironment === ExecutionEnvironment.Bare;
  if (!canUseExpoAV) return null;
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

const SARGAM_ROWS = [
  ['Sa', 'Re', 'Ga', 'Ma'],
  ['Pa', 'Dha', 'Ni', 'Sa'],
  ['Sa', 'Sa', 'Re', 'Re'],
  ['Ga', 'Ga', 'Ma', 'Ma'],
  ['Pa', 'Pa', 'Dha', 'Dha'],
  ['Ni', 'Ni', 'Sa', 'Sa'],
];

const ACTIVE_NOTE_INDEX = 0;

export default function LessonPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { lesson, loading, error } = useLesson(id);

  const videoRef = useRef<unknown>(null);
  const [status, setStatus] = useState<import('expo-av').AVPlaybackStatus | null>(null);
  const [bpm, setBpm] = useState(80);
  const [notationMode, setNotationMode] = useState<'sargam' | 'staff'>('sargam');

  const progressRef = useRef({ positionMs: 0, durationMs: 0 });
  const isPlaying = status?.isLoaded ? status.isPlaying : false;
  const positionMs = status?.isLoaded ? status.positionMillis ?? 0 : 0;
  const durationMs = status?.isLoaded ? status.durationMillis ?? 0 : 0;
  progressRef.current = { positionMs, durationMs };

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
            <Text style={lessonPlayerStyles.lessonTitle}>{lesson.title}</Text>
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

            <View style={lessonPlayerStyles.bpmRow}>
              <TouchableOpacity
                style={lessonPlayerStyles.bpmBtn}
                onPress={() => setBpm((b) => Math.max(40, b - 5))}
              >
                <Text style={lessonPlayerStyles.bpmBtnText}>−</Text>
              </TouchableOpacity>
              <View style={lessonPlayerStyles.bpmDisplay}>
                <Text style={lessonPlayerStyles.bpmText}>{bpm} BPM</Text>
              </View>
              <TouchableOpacity
                style={lessonPlayerStyles.bpmBtn}
                onPress={() => setBpm((b) => Math.min(200, b + 5))}
              >
                <Text style={lessonPlayerStyles.bpmBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <View style={lessonPlayerStyles.toggleContainer}>
              <TouchableOpacity
                style={[
                  lessonPlayerStyles.toggleOption,
                  notationMode === 'sargam' && lessonPlayerStyles.toggleOptionActive,
                ]}
                onPress={() => setNotationMode('sargam')}
              >
                <Text
                  style={[
                    lessonPlayerStyles.toggleOptionText,
                    notationMode === 'sargam' &&
                      lessonPlayerStyles.toggleOptionTextActive,
                  ]}
                >
                  Sargam
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  lessonPlayerStyles.toggleOption,
                  notationMode === 'staff' && lessonPlayerStyles.toggleOptionActive,
                ]}
                onPress={() => setNotationMode('staff')}
              >
                <Text
                  style={[
                    lessonPlayerStyles.toggleOptionText,
                    notationMode === 'staff' &&
                      lessonPlayerStyles.toggleOptionTextActive,
                  ]}
                >
                  Staff
                </Text>
              </TouchableOpacity>
            </View>

            {notationMode === 'sargam' && (
              <View style={lessonPlayerStyles.sargamGrid}>
                {SARGAM_ROWS.map((row, rowIdx) => (
                  <View key={rowIdx} style={lessonPlayerStyles.sargamRow}>
                    <Text style={lessonPlayerStyles.beatMarker}>|</Text>
                    {row.map((note, noteIdx) => {
                      const isActive = noteIdx === ACTIVE_NOTE_INDEX;
                      return (
                        <View
                          key={noteIdx}
                          style={[
                            lessonPlayerStyles.noteCircle,
                            isActive && lessonPlayerStyles.noteCircleActive,
                          ]}
                        >
                          <Text
                            style={[
                              lessonPlayerStyles.noteText,
                              isActive && lessonPlayerStyles.noteTextActive,
                            ]}
                          >
                            {note}
                          </Text>
                        </View>
                      );
                    })}
                    <Text style={lessonPlayerStyles.beatMarker}>|</Text>
                  </View>
                ))}
              </View>
            )}

            {notationMode === 'staff' && (
              <View style={lessonPlayerStyles.staffPlaceholder}>
                <Text style={lessonPlayerStyles.mutedText}>
                  Staff notation coming soon
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>

      <View style={lessonPlayerStyles.bottomBar}>
        <TouchableOpacity
          style={lessonPlayerStyles.guidedPracticeBtn}
          onPress={() => {
            void handleSaveProgress(true).then(() => router.back());
          }}
          activeOpacity={0.9}
        >
          <Text style={lessonPlayerStyles.guidedPracticeBtnText}>
            Start Guided Practice
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenGradient>
  );
}
