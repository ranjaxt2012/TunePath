import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme, Spacing, FontSize, Radius } from '@/src/design';
import { useProgress } from '@/src/hooks/useProgress';
import { useProgressStore } from '@/src/store/progressStore';
import { useLessons } from '@/src/hooks/useLessons';
import { SectionHeader } from '@/src/components/ui/SectionHeader';
import { EmptyState } from '@/src/components/ui/EmptyState';

const WEB_CONTENT_MAX = 960;

export default function LearningScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { summary, inProgress, loading: progressLoading } = useProgress();
  const { favorites, completedLessons } = useProgressStore();
  const { lessons } = useLessons();

  const favoriteLessons = lessons.filter((l) => favorites.includes(l.id));

  const hasAnything =
    (inProgress && inProgress.length > 0) ||
    favorites.length > 0 ||
    completedLessons.length > 0;

  const containerStyle = [
    styles.container,
    Platform.OS === 'web' && styles.webContainer,
  ];

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={containerStyle}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={[styles.title, { color: theme.textPrimary }]}>My Learning</Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderRadius: Radius.lg }]}>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>
              {summary?.streak_days ?? 0}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Streak 🔥</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderRadius: Radius.lg }]}>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>
              {summary?.total_minutes ?? 0}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Minutes</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderRadius: Radius.lg }]}>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>
              {summary?.lessons_completed ?? 0}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Lessons</Text>
          </View>
        </View>

        {!hasAnything && !progressLoading ? (
          <EmptyState
            emoji="📚"
            title="Start learning!"
            subtitle="Discover lessons and track your progress"
            actionLabel="Explore lessons"
            onAction={() => router.push('/(tabs)/discover' as any)}
          />
        ) : (
          <>
            {/* Continue Learning */}
            {inProgress && inProgress.length > 0 && (
              <View style={styles.section}>
                <SectionHeader title="Continue Learning" />
                {inProgress.map((item) => (
                  <TouchableOpacity
                    key={item.lesson_id}
                    style={[styles.inProgressItem, { backgroundColor: theme.surface, borderRadius: Radius.lg }]}
                    onPress={() => router.push(`/lesson/${item.lesson_id}` as any)}
                  >
                    <View style={[styles.thumbnail, { backgroundColor: theme.surfaceHigh, borderRadius: Radius.md }]}>
                      <Text style={[styles.thumbnailFallback, { color: theme.textDisabled }]}>▶</Text>
                    </View>
                    <View style={styles.inProgressInfo}>
                      <Text
                        style={[styles.inProgressTitle, { color: theme.textPrimary }]}
                        numberOfLines={2}
                      >
                        {item.title}
                      </Text>
                      <View style={[styles.progressBarTrack, { backgroundColor: theme.border }]}>
                        <View
                          style={[
                            styles.progressBarFill,
                            { width: `${item.watch_percent}%`, backgroundColor: theme.primary },
                          ]}
                        />
                      </View>
                      <Text style={[styles.progressPercent, { color: theme.textSecondary }]}>
                        {Math.round(item.watch_percent)}% watched
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.resumeButton, { backgroundColor: theme.primary, borderRadius: Radius.md }]}
                      onPress={() => router.push(`/lesson/${item.lesson_id}` as any)}
                    >
                      <Text style={[styles.resumeText, { color: theme.textOnPrimary }]}>Resume</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Saved */}
            {favorites.length > 0 && (
              <View style={styles.section}>
                <SectionHeader title="Saved" />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalRow}
                >
                  {favoriteLessons.map((lesson) => (
                    <TouchableOpacity
                      key={lesson.id}
                      style={[styles.miniCard, { backgroundColor: theme.surface, borderRadius: Radius.lg }]}
                      onPress={() => router.push(`/lesson/${lesson.id}` as any)}
                    >
                      <View style={[styles.miniThumbnail, { backgroundColor: theme.surfaceHigh, borderRadius: Radius.md }]}>
                        <Text style={{ color: theme.textDisabled, fontSize: FontSize.xl }}>🎵</Text>
                      </View>
                      <Text
                        style={[styles.miniTitle, { color: theme.textPrimary }]}
                        numberOfLines={2}
                      >
                        {lesson.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Completed */}
            {completedLessons.length > 0 && (
              <View style={styles.section}>
                <SectionHeader title={`Completed (${completedLessons.length})`} />
                {completedLessons.map((lessonId) => {
                  const lesson = lessons.find((l) => l.id === lessonId);
                  return (
                    <TouchableOpacity
                      key={lessonId}
                      style={[styles.completedRow, { backgroundColor: theme.surface, borderRadius: Radius.md, borderColor: theme.border }]}
                      onPress={() => router.push(`/lesson/${lessonId}` as any)}
                    >
                      <Text style={[styles.completedCheck, { color: theme.success }]}>✓</Text>
                      <Text style={[styles.completedTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                        {lesson?.title ?? lessonId}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  webContainer: {
    maxWidth: WEB_CONTENT_MAX,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: 'bold',
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSize.xxl,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSize.xs,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  inProgressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  thumbnail: {
    width: 80,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  thumbnailFallback: {
    fontSize: FontSize.xl,
  },
  inProgressInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  inProgressTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  progressBarTrack: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 3,
    borderRadius: 2,
  },
  progressPercent: {
    fontSize: FontSize.xs,
  },
  resumeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexShrink: 0,
  },
  resumeText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  horizontalRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  miniCard: {
    width: 130,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  miniThumbnail: {
    width: '100%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniTitle: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    gap: Spacing.md,
  },
  completedCheck: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
  },
  completedTitle: {
    flex: 1,
    fontSize: FontSize.sm,
  },
});
