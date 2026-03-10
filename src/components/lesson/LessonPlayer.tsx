/**
 * LessonPlayer - loads lesson from backend API, streams video from R2.
 * Requires courseId + lessonId (no local content).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useHarmoniumSound } from '../../hooks/useHarmoniumSound';
import { getLessonDetail } from '../../services/apiClient';
import { getCachedLesson, setCachedLesson } from '../../services/metadataCache';
import type { LessonDetail } from '../../services/apiClient';
import { DesignSystem } from '../../styles/theme';
import { LessonVideoPlayer } from './LessonVideoPlayer';
import { SargamDisplay } from './SargamDisplay';

interface LessonPlayerProps {
  courseId: number;
  lessonId: number;
  onProgressSave?: (positionSec: number, progressPercent: number, completed: boolean) => void;
}

function useRemoteLesson(lessonId: number) {
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const cached = getCachedLesson(lessonId);
    if (cached) {
      setLesson(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    getLessonDetail(lessonId)
      .then((data) => {
        setCachedLesson(data);
        setLesson(data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [lessonId]);

  return { lesson, loading, error };
}

export function LessonPlayer({ courseId, lessonId, onProgressSave }: LessonPlayerProps) {
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const lastSavedRef = useRef(0);
  const { playFirstNote } = useHarmoniumSound();
  const { lesson, loading, error } = useRemoteLesson(lessonId);

  const sections = (lesson?.sections ?? []).map((s) => ({ start: s.start, end: s.end, notation: s.notation }));
  const videoSource = lesson?.video_url ?? '';
  const thumbnailUrl = lesson?.thumbnail_url;

  const handleTimeUpdate = useCallback(
    (timeSec: number) => {
      setCurrentTimeSec(timeSec);
      if (onProgressSave) {
        if (timeSec - lastSavedRef.current >= 5) {
          lastSavedRef.current = timeSec;
          onProgressSave(timeSec, 0, false);
        }
      }
    },
    [onProgressSave]
  );

  const handlePlaybackEnd = useCallback(() => {
    if (onProgressSave) {
      onProgressSave(currentTimeSec, 100, true);
    }
  }, [onProgressSave, currentTimeSec]);

  const handlePlayLine = useCallback(
    (notation: string) => {
      playFirstNote(notation);
    },
    [playFirstNote]
  );

  if (loading) {
    return (
      <View style={[styles.scrollView, styles.centered]}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.scrollView, styles.centered]}>
        <Text style={styles.errorText}>Failed to load lesson</Text>
      </View>
    );
  }

  if (!videoSource) {
    return (
      <View style={[styles.scrollView, styles.centered]}>
        <Text style={styles.errorText}>No video available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{lesson?.title ?? ''}</Text>

      <View style={styles.videoWrapper}>
        <LessonVideoPlayer
          source={videoSource}
          thumbnailUrl={thumbnailUrl}
          onTimeUpdate={handleTimeUpdate}
          onPlaybackEnd={handlePlaybackEnd}
        />
      </View>

      <SargamDisplay
        sections={sections}
        currentTimeSec={currentTimeSec}
        onPlayLine={handlePlayLine}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: DesignSystem.colors.primary,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: DesignSystem.colors.white,
    marginBottom: 24,
  },
  videoWrapper: {
    width: '100%',
    marginBottom: 32,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 12,
  },
  errorText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
});
