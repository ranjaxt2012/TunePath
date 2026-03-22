import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import { WEB_CONTENT_MAX } from '@/src/utils/platform';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Spacing, Radius, FontSize } from '@/src/design';
import { useProgressSummary } from '@/src/hooks/useProgressSummary';
import { useInProgressLessons } from '@/src/hooks/useInProgressLessons';
import { useProgressStore } from '@/src/store/progressStore';
import { useOrientation } from '@/src/hooks/useOrientation';
import type { InProgressLesson } from '@/src/services/apiClient';

function StatCard({ label, value, theme }: { label: string; value: string | number; theme: any }) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
      <Text style={[styles.statValue, { color: theme.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

function InProgressCard({ lesson, theme, onPress }: { lesson: InProgressLesson; theme: any; onPress: () => void }) {
  const pct = lesson.watch_percent ?? 0;
  return (
    <TouchableOpacity style={[styles.inProgressCard, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.inProgressThumb, { backgroundColor: theme.surfaceHigh }]}>
        {lesson.thumbnail_url && (
          <Image source={{ uri: lesson.thumbnail_url }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        )}
      </View>
      <View style={styles.inProgressInfo}>
        <Text style={[styles.inProgressTitle, { color: theme.textPrimary }]} numberOfLines={2}>{lesson.title}</Text>
        <View style={[styles.progressBar, { backgroundColor: theme.surfaceHigh }]}>
          <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: theme.primary }]} />
        </View>
        <Text style={[styles.progressPct, { color: theme.textSecondary }]}>{pct}% done</Text>
      </View>
      <TouchableOpacity style={[styles.resumeBtn, { backgroundColor: theme.primary }]} onPress={onPress}>
        <Text style={[styles.resumeBtnText, { color: theme.textOnPrimary }]}>Resume</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function LearningScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { isLandscape } = useOrientation();
  const { summary } = useProgressSummary();
  const { lessons: inProgress, loading: inProgressLoading } = useInProgressLessons();
  const favorites = useProgressStore((s) => s.favorites);
  const completedLessons: string[] = (useProgressStore((s) => s as any).completedLessons) ?? [];

  const streak = 0; // TODO: add streak tracking
  const totalMinutes = summary ? Math.round(summary.total_practice_seconds / 60) : 0;
  const completedCount = summary?.completed_lessons ?? 0;

  const isEmpty = !inProgressLoading && inProgress.length === 0 && favorites.length === 0;

  const content = (
    <>
      {/* Stats strip */}
      <View style={styles.statsRow}>
        <StatCard label="Day Streak" value={`🔥 ${streak}`} theme={theme} />
        <StatCard label="Minutes" value={totalMinutes} theme={theme} />
        <StatCard label="Completed" value={completedCount} theme={theme} />
      </View>

      {isEmpty ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎵</Text>
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Start learning</Text>
          <Text style={[styles.emptySub, { color: theme.textSecondary }]}>Find your first lesson on Discover</Text>
          <TouchableOpacity
            style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
            onPress={() => router.navigate('/(tabs)/discover')}
          >
            <Text style={[styles.emptyBtnText, { color: theme.textOnPrimary }]}>Go to Discover</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Continue Learning */}
          {inProgress.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Continue Learning</Text>
              </View>
              {inProgress.map((lesson) => (
                <InProgressCard
                  key={lesson.id}
                  lesson={lesson}
                  theme={theme}
                  onPress={() => router.push(`/lesson/${lesson.id}` as any)}
                />
              ))}
            </View>
          )}

          {/* Saved */}
          {favorites.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Saved</Text>
              </View>
              <View style={styles.favGrid}>
                {favorites.map((id) => (
                  <TouchableOpacity
                    key={id}
                    style={[styles.favCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={() => router.push(`/lesson/${id}` as any)}
                  >
                    <Ionicons name="heart" size={20} color="#EF4444" />
                    <Text style={[styles.favId, { color: theme.textSecondary }]} numberOfLines={1}>{id}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Completed */}
          {completedLessons.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Completed</Text>
              </View>
              {completedLessons.map((id) => (
                <TouchableOpacity
                  key={id}
                  style={[styles.completedRow, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => router.push(`/lesson/${id}` as any)}
                >
                  <Ionicons name="checkmark-circle" size={24} color={theme.success} />
                  <Text style={[styles.completedId, { color: theme.textPrimary }]} numberOfLines={1}>{id}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}
    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }, Platform.OS === 'web' && { maxWidth: WEB_CONTENT_MAX }]}>
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>My Learning</Text>
        <View style={[styles.streakBadge, { backgroundColor: theme.surface }]}>
          <Text style={[styles.streakText, { color: theme.textPrimary }]}>🔥 {streak} days</Text>
        </View>
      </View>
      {isLandscape ? (
        <View style={styles.landscapeRow}>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: Spacing.xxxl, paddingHorizontal: Spacing.lg }}>
            {content}
          </ScrollView>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: Spacing.xxxl, paddingHorizontal: Spacing.lg }}>
          {content}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  streakBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  streakText: { fontSize: FontSize.sm, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  statValue: { fontSize: FontSize.xl, fontWeight: '700' },
  statLabel: { fontSize: FontSize.xs, marginTop: 2 },
  landscapeRow: { flex: 1, flexDirection: 'row' },
  section: { marginBottom: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700' },
  inProgressCard: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    alignItems: 'center',
  },
  inProgressThumb: {
    width: 80,
    height: 60,
    overflow: 'hidden',
  },
  inProgressInfo: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    gap: 4,
  },
  inProgressTitle: { fontSize: FontSize.sm, fontWeight: '600' },
  progressBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  progressPct: { fontSize: FontSize.xs },
  resumeBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    marginRight: Spacing.sm,
  },
  resumeBtnText: { fontSize: FontSize.xs, fontWeight: '700' },
  favGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  favCard: {
    width: '47%',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  favId: { fontSize: FontSize.xs, flex: 1 },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  completedId: { fontSize: FontSize.sm, flex: 1 },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    gap: Spacing.md,
  },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '700' },
  emptySub: { fontSize: FontSize.md, textAlign: 'center' },
  emptyBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
  emptyBtnText: { fontSize: FontSize.md, fontWeight: '600' },
});
