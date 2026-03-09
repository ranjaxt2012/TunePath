/**
 * LessonPlayer - orchestrates lesson loading, video playback, and notation display
 * Layout: Title | Video | Sargam notation
 */

import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useHarmoniumSound } from '../../hooks/useHarmoniumSound';
import { loadLesson, type LessonKey } from '../../services/lessonLoader';
import { DesignSystem } from '../../styles/theme';
import { LessonVideoPlayer } from './LessonVideoPlayer';
import { SargamDisplay } from './SargamDisplay';

interface LessonPlayerProps {
  lessonPath: LessonKey;
}

export function LessonPlayer({ lessonPath }: LessonPlayerProps) {
  const lesson = useMemo(() => loadLesson(lessonPath), [lessonPath]);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const { playFirstNote } = useHarmoniumSound();

  const handleTimeUpdate = useCallback((timeSec: number) => {
    setCurrentTimeSec(timeSec);
  }, []);

  const handlePlayLine = useCallback(
    (notation: string) => {
      playFirstNote(notation);
    },
    [playFirstNote]
  );

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{lesson.title}</Text>

      <View style={styles.videoWrapper}>
        <LessonVideoPlayer
          source={lesson.videoSource}
          onTimeUpdate={handleTimeUpdate}
        />
      </View>

      <SargamDisplay
        sections={lesson.sections}
        currentTimeSec={currentTimeSec}
        onPlayLine={handlePlayLine}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: DesignSystem.colors.primary,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: DesignSystem.colors.white,
    marginBottom: 24,
  },
  videoWrapper: {
    width: '100%',
    marginBottom: 32,
  },
});
