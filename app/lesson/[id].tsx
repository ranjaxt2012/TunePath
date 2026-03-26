import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useTheme, FontSize, Spacing } from '@/src/design';
import { useLesson } from '@/src/hooks/useLesson';
import { useAuthStore } from '@/src/store/authStore';
import { useProgressStore } from '@/src/store/progressStore';
import { getPlayer } from '@/src/instruments/registry';
import { Log } from '@/src/utils/log';
import { api, setAuthToken } from '@/src/services/api';
import { useAuth } from '@clerk/clerk-expo';
import type { LessonProcessingState } from '@/src/types/models';

export default function LessonPlayerScreen() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const dbUserId = useAuthStore((s) => s.dbUserId);
  const [lessonRefreshKey, setLessonRefreshKey] = useState(0);
  const lastProcessingStatusRef = useRef<string | null>(null);
  const statusPollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const terminalReachedRef = useRef(false);
  const lessonRefreshTriggeredRef = useRef(false);
  const { lesson, notes, loading, error } = useLesson(id, lessonRefreshKey);
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  const pollInFlightRef = useRef(false);

  // Keep latest getToken function without re-running polling effects.
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);

  const canEdit = useMemo(() => {
    if (!lesson || !dbUserId) return false;
    return isAdmin || lesson.tutor_id === dbUserId;
  }, [lesson, dbUserId, isAdmin]);

  useEffect(() => {
    Log.nav('opening lesson', { id });
  }, [id]);

  useEffect(() => {
    if (lesson) {
      Log.player('lesson loaded', { title: lesson.title });
    }
  }, [lesson]);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    void ScreenOrientation.unlockAsync();
    return () => {
      void ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    };
  }, []);

  useEffect(() => {
    if (!id) return;

    // Reset per-lesson polling state.
    lastProcessingStatusRef.current = null;
    terminalReachedRef.current = false;
    lessonRefreshTriggeredRef.current = false;
    setProcessingStatus(null);

    let mounted = true;
    const terminalStatuses = new Set(['review_ready', 'published', 'failed']);
    const isTerminal = (s: string | null) => (s ? terminalStatuses.has(s) : false);

    // Prevent multiple concurrent intervals if React remounts in dev.
    if (statusPollIntervalRef.current) {
      clearInterval(statusPollIntervalRef.current);
      statusPollIntervalRef.current = null;
    }

    const poll = async () => {
      if (!mounted) return;
      if (terminalReachedRef.current) return;
      if (pollInFlightRef.current) return;
      pollInFlightRef.current = true;
      try {
        const token = await getTokenRef.current();
        setAuthToken(token);
        const data = await api.get<LessonProcessingState>(`/api/tutor/lessons/${id}/status`);
        if (!mounted) return;

        const prev = lastProcessingStatusRef.current;
        lastProcessingStatusRef.current = data.status;
        setProcessingStatus(data.status);
        Log.api('lesson status poll', {
          lessonId: id,
          status: data.status,
          stage_label: data.stage_label,
          progress: data.progress_percent,
        });

        // Only once: when we transition to terminal, refresh lesson notation payload.
        if (!lessonRefreshTriggeredRef.current && !isTerminal(prev) && isTerminal(data.status)) {
          lessonRefreshTriggeredRef.current = true;
          setLessonRefreshKey((k) => k + 1);
        }

        if (isTerminal(data.status)) {
          terminalReachedRef.current = true;
          if (statusPollIntervalRef.current) {
            clearInterval(statusPollIntervalRef.current);
            statusPollIntervalRef.current = null;
          }
        }
      } catch (e: any) {
        // Status endpoint is tutor-scoped; for non-tutors we can silently ignore.
        if (String(e?.message ?? '').includes('HTTP 404')) return;
        Log.apiError('lesson status poll failed', { lessonId: id });
      } finally {
        pollInFlightRef.current = false;
      }
    };

    void poll();
    statusPollIntervalRef.current = setInterval(() => {
      void poll();
    }, 5000);

    return () => {
      mounted = false;
      if (statusPollIntervalRef.current) {
        clearInterval(statusPollIntervalRef.current);
        statusPollIntervalRef.current = null;
      }
    };
  }, [id]);

  const showProcessingWatermark =
    processingStatus !== null &&
    processingStatus !== 'review_ready' &&
    processingStatus !== 'published' &&
    processingStatus !== 'failed';

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error || !lesson) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.error }]}>
          {error ?? 'Lesson not found'}
        </Text>
      </View>
    );
  }

  const Player = getPlayer(lesson.instrument_slug ?? 'harmonium');

  if (!Player) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.textSecondary }]}>
          No player available for this instrument
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Player lesson={lesson} notes={notes} isTutor={canEdit} />
      {showProcessingWatermark && (
        <View style={[styles.processingBadge, { backgroundColor: theme.overlay }]}>
          <Text style={[styles.processingBadgeText, { color: theme.textOnPrimary }]}>
            Under processing
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: FontSize.md,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  processingBadge: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 999,
  },
  processingBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
