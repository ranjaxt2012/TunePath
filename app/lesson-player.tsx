/**
 * Lesson Player Screen - MVP
 * Loads lesson from content folder, displays video + sargam notation
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { LessonPlayer } from '../src/components/lesson';
import { getAllLessonKeys, type LessonKey } from '../src/services/lessonLoader';
import { lessonPlayerStyles } from '../src/styles/lessonPlayerStyles';

const DEFAULT_LESSON: LessonKey = 'harmonium/beginner/lesson-001-basics-sargam';

function isValidLessonKey(key: string, validKeys: LessonKey[]): key is LessonKey {
  return validKeys.includes(key as LessonKey);
}

export default function LessonPlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lesson?: string }>();
  const validKeys = getAllLessonKeys();
  const lessonKey = params.lesson && isValidLessonKey(params.lesson, validKeys)
    ? (params.lesson as LessonKey)
    : DEFAULT_LESSON;

  return (
    <View style={lessonPlayerStyles.container}>
      <Pressable
        style={({ pressed }) => [lessonPlayerStyles.backButton, { opacity: pressed ? 0.8 : 1 }]}
        onPress={() => router.back()}
      >
        <Text style={lessonPlayerStyles.backIcon}>‹</Text>
        <Text style={lessonPlayerStyles.backText}>Back</Text>
      </Pressable>
      <LessonPlayer lessonPath={lessonKey} />
    </View>
  );
}
