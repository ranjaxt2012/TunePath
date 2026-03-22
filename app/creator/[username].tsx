import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Spacing, Radius, FontSize } from '@/src/design';
import { apiPost } from '@/src/services/apiClient';
import type { Course } from '@/src/types/models';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

async function fetchCreator(username: string): Promise<any> {
  const res = await fetch(`${API_URL}/api/users/creator/${username}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchCreatorCourses(userId: string): Promise<Course[]> {
  const res = await fetch(`${API_URL}/api/courses?tutor_id=${userId}`);
  if (!res.ok) return [];
  return res.json();
}

export default function CreatorProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const [creator, setCreator] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    fetchCreator(username)
      .then(async (data) => {
        setCreator(data);
        if (data?.id) {
          const c = await fetchCreatorCourses(data.id);
          setCourses(c);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [username]);

  const handleFollow = async () => {
    if (!creator?.id) return;
    setFollowing(!following);
    try {
      await apiPost(`/api/users/${creator.id}/follow`, {});
    } catch {
      setFollowing(following);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !creator) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: theme.error }]}>{error ?? 'Creator not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const initials = (creator.displayName ?? creator.email ?? '?').slice(0, 2).toUpperCase();
  const isVerified = creator.trust_tier === 'verified';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingBottom: Spacing.xxxl }}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: theme.surface }]}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={[styles.avatarText, { color: theme.textOnPrimary }]}>{initials}</Text>
          </View>
          <Text style={[styles.displayName, { color: theme.textPrimary }]}>
            {creator.displayName ?? creator.email}
          </Text>
          {isVerified && (
            <View style={[styles.verifiedBadge, { backgroundColor: theme.primary }]}>
              <Text style={[styles.verifiedText, { color: theme.textOnPrimary }]}>✓ Verified</Text>
            </View>
          )}
          {creator.bio && (
            <Text style={[styles.bio, { color: theme.textSecondary }]}>{creator.bio}</Text>
          )}
          <TouchableOpacity
            style={[styles.followBtn, { backgroundColor: following ? theme.surface : theme.primary, borderColor: theme.border, borderWidth: following ? 1 : 0 }]}
            onPress={handleFollow}
          >
            <Text style={[styles.followBtnText, { color: following ? theme.textSecondary : theme.textOnPrimary }]}>
              {following ? 'Following ✓' : 'Follow'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Lessons', value: courses.length },
            { label: 'Followers', value: creator.follower_count ?? 0 },
            { label: 'Views', value: creator.total_views ?? 0 },
          ].map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Contact */}
        {(creator.whatsapp || creator.email_public || creator.website || creator.youtube || creator.instagram) && (
          <View style={[styles.contactCard, { backgroundColor: theme.surface }]}>
            {creator.whatsapp && (
              <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`https://wa.me/${creator.whatsapp}`)}>
                <Ionicons name="logo-whatsapp" size={20} color={theme.primary} />
                <Text style={[styles.contactLabel, { color: theme.textPrimary }]}>WhatsApp</Text>
              </TouchableOpacity>
            )}
            {creator.website && (
              <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(creator.website)}>
                <Ionicons name="globe-outline" size={20} color={theme.primary} />
                <Text style={[styles.contactLabel, { color: theme.textPrimary }]}>Website</Text>
              </TouchableOpacity>
            )}
            {creator.youtube && (
              <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(creator.youtube)}>
                <Ionicons name="logo-youtube" size={20} color={theme.primary} />
                <Text style={[styles.contactLabel, { color: theme.textPrimary }]}>YouTube</Text>
              </TouchableOpacity>
            )}
            {creator.instagram && (
              <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(creator.instagram)}>
                <Ionicons name="logo-instagram" size={20} color={theme.primary} />
                <Text style={[styles.contactLabel, { color: theme.textPrimary }]}>Instagram</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Lessons */}
        <View style={styles.lessonsSection}>
          <Text style={[styles.lessonsHeader, { color: theme.textPrimary }]}>
            Lessons by {creator.displayName ?? 'Creator'}
          </Text>
          <View style={styles.lessonsGrid}>
            {courses.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.courseCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => router.push(`/course/${c.id}` as any)}
              >
                <Text style={[styles.courseTitle, { color: theme.textPrimary }]} numberOfLines={2}>{c.title}</Text>
                <Text style={[styles.courseSub, { color: theme.textSecondary }]}>{c.instrument_slug}</Text>
              </TouchableOpacity>
            ))}
            {courses.length === 0 && (
              <Text style={[styles.noLessons, { color: theme.textDisabled }]}>No lessons published yet</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: FontSize.md },
  backBtn: { padding: Spacing.md },
  hero: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '700' },
  displayName: { fontSize: FontSize.xl, fontWeight: '700' },
  verifiedBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  verifiedText: { fontSize: FontSize.sm, fontWeight: '600' },
  bio: { fontSize: FontSize.md, textAlign: 'center', lineHeight: 22 },
  followBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    marginTop: Spacing.sm,
  },
  followBtnText: { fontSize: FontSize.md, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  statValue: { fontSize: FontSize.xl, fontWeight: '700' },
  statLabel: { fontSize: FontSize.xs, marginTop: 2 },
  contactCard: {
    margin: Spacing.lg,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  contactLabel: { fontSize: FontSize.md },
  lessonsSection: { paddingHorizontal: Spacing.lg, marginTop: Spacing.lg },
  lessonsHeader: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.md },
  lessonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  courseCard: {
    width: '47%',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  courseTitle: { fontSize: FontSize.sm, fontWeight: '600' },
  courseSub: { fontSize: FontSize.xs },
  noLessons: { fontSize: FontSize.md },
});
