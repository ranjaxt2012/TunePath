/**
 * Select Course Screen - lists courses from API after instrument + level selection
 * GET /courses/?instrument={instrument}&level={level}
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { ScreenGradient } from '@/src/components/common/ScreenGradient';
import { getCourses, type Course } from '../src/services/apiClient';
import { setCachedCourses } from '../src/services/metadataCache';
import { selectLessonStyles } from '../src/styles/selectLessonStyles';

export default function SelectCourseScreen() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [instrument, setInstrument] = useState('harmonium');
  const [level, setLevel] = useState('beginner');

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      const savedInstrument = await AsyncStorage.getItem('selectedInstrument');
      const savedLevel = await AsyncStorage.getItem('selectedLevel');
      const inst = savedInstrument ?? 'harmonium';
      const lvl = savedLevel ?? 'beginner';
      setInstrument(inst);
      setLevel(lvl);
      const data = await getCourses({ instrument: inst, level: lvl });
      setCourses(data);
      setCachedCourses(data);
    } catch (e) {
      console.warn('Failed to load courses:', e);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleCourseSelect = (courseId: string) => {
    router.push(`/course/${courseId}` as any);
  };

  const goToHome = () => {
    router.replace('/home' as any);
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
        <Text style={selectLessonStyles.title}>Courses</Text>
        <Text style={selectLessonStyles.subtitle}>
          {instrument} · {level}
        </Text>
      </View>

      <ScrollView
        style={selectLessonStyles.lessonsContainer}
        contentContainerStyle={selectLessonStyles.lessonsContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={{ paddingVertical: 48 }} />
        ) : courses.length === 0 ? (
          <Text style={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', paddingVertical: 24 }}>
            No courses found
          </Text>
        ) : (
          courses.map((course) => (
            <Pressable
              key={course.id}
              style={({ pressed }) => [selectLessonStyles.lessonCard, { opacity: pressed ? 0.8 : 1 }]}
              onPress={() => handleCourseSelect(course.id)}
            >
              <View style={selectLessonStyles.lessonHeader}>
                <Text style={selectLessonStyles.lessonTitle}>{course.title}</Text>
                <Text style={selectLessonStyles.lessonSubtitle}>
                  {course.description ?? `${course.instrument_slug} · ${course.level_slug}`}
                </Text>
              </View>
            </Pressable>
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
