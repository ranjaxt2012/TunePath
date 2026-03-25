import React, { useEffect, useMemo } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useTheme, FontSize, Spacing } from '@/src/design';
import { useLesson } from '@/src/hooks/useLesson';
import { useAuthStore } from '@/src/store/authStore';
import { useProgressStore } from '@/src/store/progressStore';
import { getPlayer } from '@/src/instruments/registry';
import { Log } from '@/src/utils/log';

export default function LessonPlayerScreen() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const dbUserId = useAuthStore((s) => s.dbUserId);
  const { lesson, notes, loading, error } = useLesson(id);

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
});
