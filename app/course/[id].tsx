/**
 * Course Screen - shows lessons and progress for a course
 * GET /courses/{id}/lessons
 * GET /courses/{id}/progress
 * POST /courses/{id}/restart
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  EmptyState,
  LessonRow,
  LoadingState,
} from '../../src/components/shared';
import {
  getCourseLessons,
  getCourseProgress,
  restartCourse,
  type CourseProgress,
  type LessonListItem,
} from '../../src/services/apiClient';
import { DesignSystem } from '../../src/styles/theme';
import { selectLessonStyles } from '../../src/styles/selectLessonStyles';

export default function CourseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const courseId = id ? parseInt(id, 10) : 0;
  const [lessons, setLessons] = useState<LessonListItem[]>([]);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [restarting, setRestarting] = useState(false);

  const load = useCallback(async () => {
    if (!courseId || isNaN(courseId)) return;
    setLoading(true);
    try {
      const [lessonsData, progressData] = await Promise.all([
        getCourseLessons(courseId),
        getCourseProgress(courseId),
      ]);
      setLessons(lessonsData);
      setProgress(progressData);
      // Do not cache list items; player fetches full detail on open
    } catch (e) {
      console.warn('Failed to load course:', e);
      setLessons([]);
      setProgress(null);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleLessonSelect = (lessonId: number) => {
    router.push({
      pathname: '/lesson-player',
      params: { courseId: String(courseId), lessonId: String(lessonId) },
    } as any);
  };

  const handleRestart = useCallback(async () => {
    if (!courseId || restarting) return;
    setRestarting(true);
    try {
      await restartCourse(courseId);
      await load();
    } catch (e) {
      console.warn('Failed to restart course:', e);
    } finally {
      setRestarting(false);
    }
  }, [courseId, restarting, load]);

  const currentLessonId = progress?.current_lesson_id ?? progress?.last_lesson_id;
  const sortedLessons = [...lessons].sort((a, b) => a.lesson_order - b.lesson_order);

  return (
    <View style={selectLessonStyles.container}>
      <View style={selectLessonStyles.backButtonContainer}>
        <Pressable
          style={({ pressed }) => [selectLessonStyles.backButton, { opacity: pressed ? 0.8 : 1 }]}
          onPress={() => router.back()}
        >
          <Text style={selectLessonStyles.backIcon}>‹</Text>
          <Text style={selectLessonStyles.backText}>Back</Text>
        </Pressable>
      </View>

      <View style={selectLessonStyles.headerContainer}>
        <Text style={selectLessonStyles.title}>Course</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <Text style={selectLessonStyles.subtitle}>
            {progress != null && progress.progress_percent > 0
              ? `${Math.round(progress.progress_percent)}% complete`
              : `${lessons.length} lessons`}
          </Text>
          {progress != null && progress.progress_percent > 0 && (
            <Pressable
              style={({ pressed }) => [{ paddingVertical: 4, paddingHorizontal: 12, opacity: pressed ? 0.8 : 1 }]}
              onPress={handleRestart}
              disabled={restarting}
            >
              <Text style={{ fontSize: 14, color: DesignSystem.colors.whiteOverlay['80'] }}>
                {restarting ? 'Restarting...' : 'Restart'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        style={selectLessonStyles.lessonsContainer}
        contentContainerStyle={selectLessonStyles.lessonsContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <LoadingState message="Loading course..." />
        ) : lessons.length === 0 ? (
          <EmptyState message="No lessons found" />
        ) : (
          sortedLessons.map((lesson) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              isCurrent={lesson.id === currentLessonId}
              onPress={() => handleLessonSelect(lesson.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
