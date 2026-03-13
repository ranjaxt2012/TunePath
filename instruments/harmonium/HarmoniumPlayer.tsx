/**
 * HarmoniumPlayer - placeholder. Will host lesson video + sargam/notation UI.
 */

import { StyleSheet, Text, View } from 'react-native';
import type { LessonPlayerProps } from '@/src/registry/types';

export function HarmoniumPlayer({ lesson, onComplete, onProgress }: LessonPlayerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>HarmoniumPlayer</Text>
      <Text style={styles.subtext}>{lesson.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  subtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
});
