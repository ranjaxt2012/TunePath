/**
 * Select Lesson - lists courses from API; tap course to open lessons.
 * All data from backend.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { CourseCard } from '../src/components/course';
import { EmptyState, ErrorState, LoadingState, ScreenGradient } from '@/src/components/common';
import { getCourses, type Course } from '../src/services/apiClient';
import { selectLessonStyles } from '../src/styles/selectLessonStyles';

export default function SelectLessonScreen() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [instrument, setInstrument] = useState('harmonium');
  const [level, setLevel] = useState('beginner');

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const inst = await AsyncStorage.getItem('selectedInstrument');
      const lvl = await AsyncStorage.getItem('selectedLevel');
      const i = inst ?? 'harmonium';
      const l = lvl ?? 'beginner';
      setInstrument(i);
      setLevel(l);
      const data = await getCourses({ instrument: i, level: l });
      setCourses(data);
    } catch {
      setCourses([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const goToHome = useCallback(() => {
    router.replace('/home' as any);
  }, [router]);

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
        <Text style={selectLessonStyles.title}>Practice Lessons</Text>
        <Text style={selectLessonStyles.subtitle}>
          {instrument} · {level} — pick a course, then choose a lesson
        </Text>
      </View>

      <ScrollView
        style={selectLessonStyles.lessonsContainer}
        contentContainerStyle={selectLessonStyles.lessonsContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <LoadingState message="Loading courses..." />
        ) : error ? (
          <ErrorState message="Could not load courses" onRetry={load} />
        ) : courses.length === 0 ? (
          <EmptyState title="No courses found" subtitle="Choose instrument & level first." />
        ) : (
          courses.map((course) => (
            <View key={course.id} style={{ marginBottom: 16 }}>
              <CourseCard course={course} variant="vertical" />
            </View>
          ))
        )}
        <Pressable
          style={({ pressed }) => [selectLessonStyles.continueButton, { opacity: pressed ? 0.8 : 1 }]}
          onPress={goToHome}
        >
          <Text style={selectLessonStyles.continueButtonText}>Continue to Learn</Text>
        </Pressable>
      </ScrollView>
    </ScreenGradient>
  );
}
