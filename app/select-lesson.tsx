/**
 * Select Lesson Screen - list of practice lessons; choose one to play or continue to home
 */

import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { getAllLessonKeys, loadLesson, type LessonKey } from '../src/services/lessonLoader';
import { selectLessonStyles } from '../src/styles/selectLessonStyles';

export default function SelectLessonScreen() {
  const router = useRouter();
  const lessonKeys = getAllLessonKeys();

  const handleLessonSelect = (lessonPath: LessonKey) => {
    router.push({ pathname: '/lesson-player', params: { lesson: lessonPath } });
  };

  const goToHome = () => {
    router.replace('/home' as any);
  };

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
        <Text style={selectLessonStyles.title}>Practice Lessons</Text>
        <Text style={selectLessonStyles.subtitle}>Choose a lesson to practice or continue to your home screen</Text>
      </View>

      <ScrollView
        style={selectLessonStyles.lessonsContainer}
        contentContainerStyle={selectLessonStyles.lessonsContent}
        showsVerticalScrollIndicator={false}
      >
        {lessonKeys.map((key) => {
          const lesson = loadLesson(key);
          return (
            <Pressable
              key={key}
              style={({ pressed }) => [selectLessonStyles.lessonCard, { opacity: pressed ? 0.8 : 1 }]}
              onPress={() => handleLessonSelect(key)}
            >
              <View style={selectLessonStyles.lessonHeader}>
                <Text style={selectLessonStyles.lessonTitle}>{lesson.title}</Text>
                <Text style={selectLessonStyles.lessonSubtitle}>
                  {lesson.sections.length} section{lesson.sections.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </Pressable>
          );
        })}
        <Pressable
          style={({ pressed }) => [selectLessonStyles.continueButton, { opacity: pressed ? 0.8 : 1 }]}
          onPress={goToHome}
        >
          <Text style={selectLessonStyles.continueButtonText}>Continue to Home</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
