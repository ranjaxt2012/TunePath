import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { CourseCard } from '../../src/components/course';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  SectionHeader,
} from '../../src/components/shared';
import { BottomTabBar } from '../../src/components/ui';
import {
  getCourses,
  getRecentCourses,
  type Course,
} from '../../src/services/apiClient';
import { setCachedCourses } from '../../src/services/metadataCache';
import { homeStyles } from '../../src/styles/homeStyles';
import { DesignSystem } from '../../src/styles/theme';

export default function HomeScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const [instrument, setInstrument] = useState('harmonium'); // slug
  const [level, setLevel] = useState('beginner'); // slug

  // Continue Learning
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentError, setRecentError] = useState(false);

  // Recently Added & Browse All
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [allLoading, setAllLoading] = useState(false);
  const [allError, setAllError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const savedInstrument = await AsyncStorage.getItem('selectedInstrument');
        const savedLevel = await AsyncStorage.getItem('selectedLevel');
        if (savedInstrument) setInstrument(savedInstrument);
        if (savedLevel) setLevel(savedLevel);
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    if (isFocused) {
      (async () => {
        try {
          const savedInstrument = await AsyncStorage.getItem('selectedInstrument');
          const savedLevel = await AsyncStorage.getItem('selectedLevel');
          if (savedInstrument) setInstrument(savedInstrument);
          if (savedLevel) setLevel(savedLevel);
        } catch {
          // ignore
        }
      })();
    }
  }, [isFocused]);

  // Load recent courses
  useEffect(() => {
    if (!isFocused) return;
    setRecentLoading(true);
    setRecentError(false);
    getRecentCourses()
      .then((courses) => {
        setRecentCourses(courses);
        setCachedCourses(courses);
      })
      .catch(() => {
        setRecentCourses([]);
        setRecentError(true);
      })
      .finally(() => setRecentLoading(false));
  }, [isFocused]);

  // Load courses for instrument/level (Recently Added + Browse All)
  useEffect(() => {
    if (!isFocused) return;
    setAllLoading(true);
    setAllError(false);
    getCourses(instrument, level)
      .then((courses) => {
        const sorted = [...courses].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
        setAllCourses(sorted);
        setCachedCourses(courses);
      })
      .catch(() => {
        setAllCourses([]);
        setAllError(true);
      })
      .finally(() => setAllLoading(false));
  }, [isFocused, instrument, level]);

  const goToSelectInstrument = useCallback(
    () => router.push('/select-instrument'),
    [router]
  );
  const goToSelectCourse = useCallback(
    () => router.push('/select-course'),
    [router]
  );

  return (
    <View style={homeStyles.container}>
      <View style={homeStyles.headerContainer}>
        <Pressable
          style={({ pressed }) => [
            homeStyles.backButton,
            { opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={goToSelectInstrument}
        >
          <Text style={homeStyles.backIcon}>‹</Text>
          <Text style={homeStyles.backText}>Back</Text>
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={homeStyles.headerContent}>
          <Text style={homeStyles.welcomeTitle}>Learn</Text>
          <Text style={homeStyles.welcomeSubtitle}>
            {instrument.charAt(0).toUpperCase() + instrument.slice(1)} · {level.charAt(0).toUpperCase() + level.slice(1)}
          </Text>
        </View>

        {/* 1. Continue Learning */}
        <View style={homeStyles.section}>
          <SectionHeader title="Continue Learning" />
          {recentLoading ? (
            <LoadingState message="Loading..." />
          ) : recentError ? (
            <ErrorState message="Could not load recent courses" />
          ) : recentCourses.length === 0 ? (
            <EmptyState message="No courses in progress. Start a new course below." />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={homeStyles.horizontalScroll}
            >
              {recentCourses.map((c) => (
                <CourseCard key={c.id} course={c} variant="horizontal" />
              ))}
            </ScrollView>
          )}
        </View>

        {/* 2. Recently Added */}
        <View style={homeStyles.section}>
          <SectionHeader title="Recently Added" />
          {allLoading ? (
            <LoadingState message="Loading..." />
          ) : allError ? (
            <ErrorState message="Could not load courses" />
          ) : allCourses.length === 0 ? (
            <EmptyState message="No courses yet" />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={homeStyles.horizontalScroll}
            >
              {allCourses.map((c) => (
                <CourseCard key={c.id} course={c} variant="horizontal" />
              ))}
            </ScrollView>
          )}
        </View>

        {/* 3. Coming Soon */}
        <View style={homeStyles.section}>
          <SectionHeader title="Coming Soon" />
          <EmptyState message="More courses coming soon" />
        </View>

        {/* 4. Browse All Courses */}
        <View style={homeStyles.section}>
          <SectionHeader title="Browse All Courses" />
          <Pressable
            style={({ pressed }) => [
              homeStyles.secondaryButton,
              {
                opacity: pressed ? 0.8 : 1,
                marginHorizontal: DesignSystem.spacing.xl,
                marginBottom: 12,
              },
            ]}
            onPress={goToSelectCourse}
          >
            <Text style={homeStyles.secondaryButtonText}>
              Choose instrument & level
            </Text>
          </Pressable>
          {allLoading ? (
            <LoadingState message="Loading..." />
          ) : allError ? (
            <ErrorState message="Could not load courses" />
          ) : allCourses.length === 0 ? (
            <EmptyState message="No courses found" />
          ) : (
            <View style={homeStyles.verticalList}>
              {allCourses.map((c) => (
                <CourseCard key={c.id} course={c} variant="vertical" />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <BottomTabBar activeTab="home" />
    </View>
  );
}
