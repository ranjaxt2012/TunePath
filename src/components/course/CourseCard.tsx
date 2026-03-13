/**
 * CourseCard - reusable card for course display
 * Supports horizontal (compact) and vertical (list) layouts
 */

import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Course } from '../../types/models';
import { DesignSystem } from '../../styles/theme';

interface CourseCardProps {
  course: Course;
  variant?: 'horizontal' | 'vertical';
}

export function CourseCard({ course, variant = 'vertical' }: CourseCardProps) {
  const router = useRouter();
  const isHorizontal = variant === 'horizontal';

  const handlePress = () => {
    router.push(`/course/${course.id}` as any);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        isHorizontal ? styles.cardHorizontal : styles.cardVertical,
        { opacity: pressed ? 0.8 : 1 },
      ]}
      onPress={handlePress}
    >
      <View style={[styles.thumbnail, isHorizontal ? styles.thumbnailHorizontal : styles.thumbnailVertical]}>
        {course.thumbnail_key ? (
          <Image
            source={{ uri: course.thumbnail_key }}
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.thumbnailIcon}>🎵</Text>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {course.description ?? `${course.instrument_slug} · ${course.level_slug}`}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    ...DesignSystem.components.glassCard,
    overflow: 'hidden',
  },
  cardHorizontal: {
    width: 160,
    marginRight: DesignSystem.spacing.lg,
  },
  cardVertical: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.md,
    padding: DesignSystem.spacing.sm,
  },
  thumbnail: {
    backgroundColor: DesignSystem.colors.whiteOverlay['20'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailHorizontal: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  thumbnailVertical: {
    width: 80,
    height: 56,
    borderRadius: DesignSystem.borderRadius.lg,
    marginRight: DesignSystem.spacing.md,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailIcon: {
    fontSize: 32,
  },
  content: {
    padding: DesignSystem.spacing.md,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignSystem.colors.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: DesignSystem.colors.whiteOverlay['70'],
  },
});
