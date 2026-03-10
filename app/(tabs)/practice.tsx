import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { BottomTabBar } from '../../src/components/ui';
import { practiceStyles } from '../../src/styles/practiceStyles';

export default function PracticeScreen() {
  const router = useRouter();

  const goToSelectCourse = useCallback(() => router.push('/select-course' as any), [router]);
  const goToSelectLesson = useCallback(() => router.push('/select-lesson' as any), [router]);

  return (
    <View style={practiceStyles.container}>
      <View style={practiceStyles.headerContainer}>
        <Text style={practiceStyles.title}>Practice</Text>
      </View>

      <ScrollView
        style={practiceStyles.mainContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={practiceStyles.section}>
          <Text style={practiceStyles.sectionTitle}>Choose instrument & level</Text>
          <Pressable
            style={({ pressed }) => [practiceStyles.lessonCard, { opacity: pressed ? 0.8 : 1 }]}
            onPress={goToSelectCourse}
          >
            <View style={practiceStyles.lessonHeader}>
              <View style={practiceStyles.lessonInfo}>
                <Text style={practiceStyles.lessonTitle}>Browse courses</Text>
                <Text style={practiceStyles.lessonDuration}>Select instrument and level</Text>
              </View>
              <Pressable style={({ pressed }) => [practiceStyles.startButton, { opacity: pressed ? 0.8 : 1 }]}>
                <Text style={practiceStyles.startButtonText}>Go</Text>
              </Pressable>
            </View>
          </Pressable>
        </View>

        <View style={practiceStyles.section}>
          <Text style={practiceStyles.sectionTitle}>Practice from recent</Text>
          <Pressable
            style={({ pressed }) => [practiceStyles.lessonCard, { opacity: pressed ? 0.8 : 1 }]}
            onPress={goToSelectLesson}
          >
            <View style={practiceStyles.lessonHeader}>
              <View style={practiceStyles.lessonInfo}>
                <Text style={practiceStyles.lessonTitle}>Practice lessons</Text>
                <Text style={practiceStyles.lessonDuration}>Pick a course to start</Text>
              </View>
              <Pressable style={({ pressed }) => [practiceStyles.startButton, { opacity: pressed ? 0.8 : 1 }]}>
                <Text style={practiceStyles.startButtonText}>Go</Text>
              </Pressable>
            </View>
          </Pressable>
        </View>
      </ScrollView>

      <BottomTabBar activeTab="practice" />
    </View>
  );
}
