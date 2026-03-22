import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Spacing, FontSize, Radius } from '@/src/design';
import { api } from '@/src/services/api';
import { Avatar } from '@/src/components/ui/Avatar';
import { LessonCard } from '@/src/components/ui/LessonCard';
import type { Creator, Lesson } from '@/src/types/models';

export default function CreatorScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  const { theme } = useTheme();

  const [creator, setCreator] = useState<Creator | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    Promise.all([
      api.get<Creator>(`/api/creators/${username}`),
      api.get<Lesson[]>(`/api/creators/${username}/lessons`),
    ])
      .then(([c, l]) => {
        setCreator(c);
        setLessons(l);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [username]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          {creator?.display_name ?? username ?? 'Creator'}
        </Text>
        <View style={styles.backBtn} />
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      )}

      {error && !loading && (
        <View style={styles.center}>
          <Text style={{ color: theme.textSecondary }}>Could not load creator</Text>
        </View>
      )}

      {creator && !loading && (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Profile card */}
          <View style={[styles.profileCard, { backgroundColor: theme.surface }]}>
            <Avatar
              name={creator.display_name}
              imageUrl={creator.avatar_url}
              size={72}
            />
            <Text style={[styles.displayName, { color: theme.textPrimary }]}>
              {creator.display_name}
              {creator.is_verified ? ' ✓' : ''}
            </Text>
            {creator.bio && (
              <Text style={[styles.bio, { color: theme.textSecondary }]}>{creator.bio}</Text>
            )}
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={[styles.statNum, { color: theme.textPrimary }]}>
                  {creator.follower_count}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Followers</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statNum, { color: theme.textPrimary }]}>
                  {creator.lesson_count}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Lessons</Text>
              </View>
            </View>

            {/* Social links */}
            <View style={styles.socialRow}>
              {creator.youtube && (
                <TouchableOpacity
                  style={[styles.socialBtn, { backgroundColor: theme.surfaceHigh }]}
                  onPress={() => Linking.openURL(creator.youtube!)}
                >
                  <Ionicons name="logo-youtube" size={18} color={theme.textPrimary} />
                </TouchableOpacity>
              )}
              {creator.instagram && (
                <TouchableOpacity
                  style={[styles.socialBtn, { backgroundColor: theme.surfaceHigh }]}
                  onPress={() => Linking.openURL(creator.instagram!)}
                >
                  <Ionicons name="logo-instagram" size={18} color={theme.textPrimary} />
                </TouchableOpacity>
              )}
              {creator.website && (
                <TouchableOpacity
                  style={[styles.socialBtn, { backgroundColor: theme.surfaceHigh }]}
                  onPress={() => Linking.openURL(creator.website!)}
                >
                  <Ionicons name="globe-outline" size={18} color={theme.textPrimary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Lessons */}
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Lessons</Text>
          {lessons.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No lessons yet</Text>
          ) : (
            lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                size="regular"
                onPress={() => router.push(`/lesson/${lesson.id}` as any)}
              />
            ))
          )}
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 40 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  profileCard: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  displayName: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  bio: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginBottom: Spacing.md,
  },
  stat: { alignItems: 'center' },
  statNum: { fontSize: FontSize.lg, fontWeight: '700' },
  statLabel: { fontSize: FontSize.xs },
  socialRow: { flexDirection: 'row', gap: Spacing.sm },
  socialBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  emptyText: { fontSize: FontSize.md },
});
