/**
 * GuitarPlayer - placeholder.
 */

import { useTheme } from '@/src/contexts/ThemeContext';
import { StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/src/constants/theme';
import type { LessonPlayerProps } from '@/src/registry/types';

export function GuitarPlayer({ lesson }: LessonPlayerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>GuitarPlayer</Text>
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
    fontFamily: Typography.semiBold,
    color: '#FFFFFF',
  },
  subtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
});
