import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { LessonListItem } from '@/src/types/models';
import { InstrumentIcon } from '@/src/components/common/InstrumentIcon';
import { Typography } from '@/src/constants/theme';
import { DesignSystem } from '@/src/styles/theme';

interface LessonRowProps {
  lesson: LessonListItem;
  isCurrent?: boolean;
  onPress: () => void;
}

export function LessonRow({ lesson, isCurrent, onPress }: LessonRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        isCurrent && styles.rowCurrent,
        { opacity: pressed ? 0.8 : 1 },
      ]}
      onPress={onPress}
    >
      {lesson.thumbnail_key ? (
        <Image
          source={{ uri: lesson.thumbnail_key }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
          <InstrumentIcon slug={(lesson as { instrument_slug?: string }).instrument_slug ?? ''} size={24} />
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {lesson.title}
        </Text>
        <Text style={styles.subtitle}>
          Lesson {lesson.lesson_number ?? ''}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.sm,
    ...DesignSystem.components.glassCard,
  },
  rowCurrent: {
    ...DesignSystem.components.glassCardSelected,
  },
  thumbnail: {
    width: 80,
    height: 56,
    borderRadius: DesignSystem.borderRadius.lg,
    marginRight: DesignSystem.spacing.lg,
  },
  thumbnailPlaceholder: {
    backgroundColor: DesignSystem.colors.whiteOverlay['15'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: Typography.semiBold,
    color: DesignSystem.colors.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: DesignSystem.colors.whiteOverlay['70'],
  },
});
