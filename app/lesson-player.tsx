/**
 * Lesson Player Screen - loads lesson from backend, streams video from R2.
 * Requires courseId + lessonId. Redirects to Learn if missing.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { LessonPlayer } from '../src/components/lesson';
import { lessonPlayerStyles } from '../src/styles/lessonPlayerStyles';
import { saveProgress } from '../src/services/apiClient';

export default function LessonPlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ courseId?: string; lessonId?: string }>();
  const courseId = params.courseId ?? undefined;
  const lessonId = params.lessonId ?? undefined;

  useEffect(() => {
    if (!courseId || !lessonId) {
      router.replace('/home' as any);
    }
  }, [courseId, lessonId, router]);

  const handleProgressSave = useCallback(
    async (positionSec: number, progressPercent: number, completed: boolean) => {
      if (!courseId || !lessonId) return;
      try {
        await saveProgress({
          lesson_id: lessonId,
          course_id: courseId,
          watch_percent: completed ? 100 : Math.round(progressPercent),
          last_position_seconds: Math.round(positionSec),
        });
      } catch (e) {
        console.warn('Failed to save progress:', e);
      }
    },
    [courseId, lessonId]
  );

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  if (!courseId || !lessonId) {
    return null;
  }

  return (
    <View style={lessonPlayerStyles.container}>
      <Pressable
        style={({ pressed }) => [lessonPlayerStyles.backButton, { opacity: pressed ? 0.8 : 1 }]}
        onPress={handleBack}
      >
        <Text style={lessonPlayerStyles.backIcon}>‹</Text>
        <Text style={lessonPlayerStyles.backText}>Back</Text>
      </Pressable>
      <LessonPlayer
        courseId={courseId}
        lessonId={lessonId}
        onProgressSave={handleProgressSave}
      />
    </View>
  );
}
