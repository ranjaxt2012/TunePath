import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Spacing, Radius, FontSize } from '@/src/design';
import type { Lesson } from '@/src/types/models';

interface LessonCardProps {
  lesson: Lesson;
  size: 'mini' | 'regular' | 'featured';
  onPress: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function LessonCard({ lesson, size, onPress }: LessonCardProps) {
  const { theme } = useTheme();

  if (size === 'mini') {
    return (
      <TouchableOpacity
        style={[styles.miniCard, { backgroundColor: theme.surface }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {/* Thumbnail */}
        <View style={styles.miniThumbContainer}>
          {lesson.thumbnail_url ? (
            <Image source={{ uri: lesson.thumbnail_url }} style={styles.miniThumb} resizeMode="cover" />
          ) : (
            <View style={[styles.miniThumb, { backgroundColor: theme.surfaceHigh, alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="musical-notes" size={24} color={theme.textDisabled} />
            </View>
          )}
          {/* Duration badge top-right */}
          <View style={[styles.durationBadge, { backgroundColor: theme.overlay }]}>
            <Text style={[styles.durationText, { color: theme.textOnPrimary }]}>
              {formatDuration(lesson.duration_seconds)}
            </Text>
          </View>
        </View>
        {/* Info */}
        <View style={styles.miniInfo}>
          <Text style={[styles.miniTitle, { color: theme.textPrimary }]} numberOfLines={2}>
            {lesson.title}
          </Text>
          <View style={styles.creatorRow}>
            <Text style={[styles.creatorName, { color: theme.textSecondary }]} numberOfLines={1}>
              {lesson.creator_name ?? 'Unknown'}
            </Text>
            {lesson.creator_verified && (
              <Text style={[styles.verifiedDot, { color: theme.primary }]}> •</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (size === 'regular') {
    return (
      <TouchableOpacity
        style={[styles.regularCard, { backgroundColor: theme.surface }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {/* Left thumbnail */}
        <View style={styles.regularThumbContainer}>
          {lesson.thumbnail_url ? (
            <Image source={{ uri: lesson.thumbnail_url }} style={styles.regularThumb} resizeMode="cover" />
          ) : (
            <View style={[styles.regularThumb, { backgroundColor: theme.surfaceHigh, alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="musical-notes" size={20} color={theme.textDisabled} />
            </View>
          )}
        </View>
        {/* Right info */}
        <View style={styles.regularInfo}>
          <Text style={[styles.regularTitle, { color: theme.textPrimary }]} numberOfLines={2}>
            {lesson.title}
          </Text>
          <View style={styles.creatorRow}>
            <Text style={[styles.creatorName, { color: theme.textSecondary }]} numberOfLines={1}>
              {lesson.creator_name ?? 'Unknown'}
            </Text>
            {lesson.creator_verified && (
              <Text style={[styles.verifiedDot, { color: theme.primary }]}> •</Text>
            )}
          </View>
          {lesson.level_slug && (
            <View style={[styles.levelBadge, { backgroundColor: theme.primaryLight }]}>
              <Text style={[styles.levelText, { color: theme.primary }]}>
                {lesson.level_slug}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // featured
  return (
    <TouchableOpacity style={styles.featuredCard} onPress={onPress} activeOpacity={0.9}>
      {/* Background thumbnail */}
      {lesson.thumbnail_url ? (
        <Image
          source={{ uri: lesson.thumbnail_url }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.surfaceHigh }]} />
      )}

      {/* Duration badge top-right */}
      <View style={[styles.featuredDurationBadge, { backgroundColor: theme.overlay }]}>
        <Text style={[styles.durationText, { color: theme.textOnPrimary }]}>
          {formatDuration(lesson.duration_seconds)}
        </Text>
      </View>

      {/* Center play button */}
      <View style={[styles.featuredPlayBtn, { backgroundColor: theme.primary }]}>
        <Ionicons name="play" size={28} color={theme.textOnPrimary} style={{ marginLeft: 3 }} />
      </View>

      {/* Bottom gradient overlay with title + creator */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.75)']}
        style={styles.featuredGradient}
      >
        <Text style={[styles.featuredTitle, { color: theme.textOnPrimary }]} numberOfLines={2}>
          {lesson.title}
        </Text>
        <View style={styles.creatorRow}>
          <Text style={[styles.featuredCreator, { color: theme.textOnPrimary }]} numberOfLines={1}>
            {lesson.creator_name ?? 'Unknown'}
          </Text>
          {lesson.creator_verified && (
            <Text style={[styles.verifiedDot, { color: theme.primary }]}> •</Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Mini
  miniCard: {
    width: 140,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  miniThumbContainer: {
    width: '100%',
    height: 90,
    position: 'relative',
  },
  miniThumb: {
    width: '100%',
    height: 90,
  },
  miniInfo: {
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  miniTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    lineHeight: 18,
  },

  // Regular
  regularCard: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
  },
  regularThumbContainer: {
    width: 100,
    height: 75,
  },
  regularThumb: {
    width: 100,
    height: 75,
  },
  regularInfo: {
    flex: 1,
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  regularTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    lineHeight: 18,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  levelText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // Featured
  featuredCard: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredDurationBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  featuredPlayBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  featuredTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    lineHeight: 22,
  },
  featuredCreator: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    opacity: 0.9,
  },

  // Shared
  durationBadge: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
  },
  durationText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorName: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    flexShrink: 1,
  },
  verifiedDot: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
});
