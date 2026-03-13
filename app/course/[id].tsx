import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { EmptyState, ErrorState, LoadingState, ScreenGradient } from '@/src/components/common';
import { LessonRow } from '@/src/components/course';
import { useCourse } from '@/src/hooks/useCourse';
import { useAuthStore } from '@/src/store/authStore';
import { selectLessonStyles } from '@/src/styles/selectLessonStyles';

export default function CourseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { course, loading, error, refetch } = useCourse(id);
  const { selectedInstrumentSlug } = useAuthStore();

  const handleLessonSelect = (lessonId: string) => {
    router.push({
      pathname: `/lesson/${lessonId}`,
      params: { courseId: id, instrument: selectedInstrumentSlug ?? 'harmonium' },
    } as never);
  };

  return (
    <ScreenGradient style={selectLessonStyles.container}>
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
        <Text style={selectLessonStyles.title}>{course?.title ?? 'Course'}</Text>
        {course && (
          <Text style={selectLessonStyles.subtitle}>
            {course.lessons.length} lesson{course.lessons.length !== 1 ? 's' : ''}
            {course.description ? ` · ${course.description}` : ''}
          </Text>
        )}
      </View>

      <ScrollView
        style={selectLessonStyles.lessonsContainer}
        contentContainerStyle={selectLessonStyles.lessonsContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <LoadingState message="Loading course..." />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : !course || course.lessons.length === 0 ? (
          <EmptyState title="No lessons found" />
        ) : (
          [...course.lessons]
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((lesson) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                onPress={() => handleLessonSelect(lesson.id)}
              />
            ))
        )}
      </ScrollView>
    </ScreenGradient>
  );
}
