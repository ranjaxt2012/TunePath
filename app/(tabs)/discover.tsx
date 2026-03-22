import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { WEB_CONTENT_MAX } from '@/src/utils/platform';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Spacing, Radius, FontSize } from '@/src/design';
import { useFeaturedCourse } from '@/src/hooks/useFeaturedCourse';
import { useCourses } from '@/src/hooks/useCourses';
import { useAuthStore } from '@/src/store/authStore';
import { useOrientation } from '@/src/hooks/useOrientation';
import type { Course } from '@/src/types/models';

const TAGS = ['All', 'Harmonium', 'Guitar', 'Piano', 'Classical', 'Folk', 'Bollywood', 'Devotional'];
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

function thumbnailUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  return `${API_URL}/storage/${key}`;
}

function ShimmerCard({ theme }: { theme: any }) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);
  return (
    <Animated.View
      style={[
        styles.lessonCard,
        { backgroundColor: theme.surface, opacity },
      ]}
    >
      <View style={[styles.lessonCardThumb, { backgroundColor: theme.surfaceHigh }]} />
      <View style={{ padding: 6, gap: 4 }}>
        <View style={{ height: 10, width: '80%', borderRadius: 4, backgroundColor: theme.surfaceHigh }} />
        <View style={{ height: 8, width: '50%', borderRadius: 4, backgroundColor: theme.surfaceHigh }} />
      </View>
    </Animated.View>
  );
}

function LessonCard({ course, onPress, theme }: { course: Course; onPress: () => void; theme: any }) {
  const thumb = thumbnailUrl(course.thumbnail_key);
  return (
    <TouchableOpacity style={[styles.lessonCard, { backgroundColor: theme.surface }]} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.lessonCardThumb, { backgroundColor: theme.surfaceHigh }]}>
        {thumb && (
          <Image source={{ uri: thumb }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        )}
      </View>
      <View style={styles.lessonCardInfo}>
        <Text style={[styles.lessonCardTitle, { color: theme.textPrimary }]} numberOfLines={2}>
          {course.title}
        </Text>
        <Text style={[styles.lessonCardSub, { color: theme.textSecondary }]} numberOfLines={1}>
          {course.instrument_slug}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function SectionHeader({ title, theme }: { title: string; theme: any }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{title}</Text>
      <Text style={[styles.seeAll, { color: theme.primary }]}>See all</Text>
    </View>
  );
}

function ContentArea({
  theme,
  router,
  featuredCourse,
  featuredLoading,
  courses,
  coursesLoading,
}: {
  theme: any;
  router: any;
  featuredCourse: Course | null;
  featuredLoading: boolean;
  courses: Course[];
  coursesLoading: boolean;
}) {
  const thumb = featuredCourse ? thumbnailUrl(featuredCourse.thumbnail_key) : null;

  return (
    <>
      {/* Featured Hero */}
      <TouchableOpacity
        style={[styles.hero, { backgroundColor: theme.surfaceHigh }]}
        activeOpacity={0.9}
        onPress={() => featuredCourse && router.push(`/course/${featuredCourse.id}` as any)}
      >
        {thumb ? (
          <Image source={{ uri: thumb }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        ) : null}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={[StyleSheet.absoluteFillObject, styles.heroGradient]}
        />
        <View style={styles.heroPlay}>
          <Ionicons name="play-circle" size={56} color="rgba(255,255,255,0.9)" />
        </View>
        {featuredCourse && (
          <View style={styles.heroInfo}>
            <Text style={styles.heroTitle} numberOfLines={1}>{featuredCourse.title}</Text>
            <Text style={styles.heroSub}>{featuredCourse.instrument_slug} · {featuredCourse.level_slug}</Text>
          </View>
        )}
        {featuredLoading && (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.surfaceHigh }]} />
        )}
      </TouchableOpacity>

      {/* Rows */}
      {(['Trending', 'New Lessons', 'For You'] as const).map((label) => (
        <View key={label} style={{ marginBottom: Spacing.lg }}>
          <SectionHeader title={label} theme={theme} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: Spacing.md }}>
            {coursesLoading
              ? [1, 2, 3].map((i) => <ShimmerCard key={i} theme={theme} />)
              : courses.length === 0
              ? null
              : courses.slice(0, 10).map((c) => (
                  <LessonCard
                    key={c.id}
                    course={c}
                    theme={theme}
                    onPress={() => router.push(`/course/${c.id}` as any)}
                  />
                ))}
          </ScrollView>
        </View>
      ))}

      {/* Empty state */}
      {!coursesLoading && courses.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎵</Text>
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No lessons yet</Text>
          <TouchableOpacity
            style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/(tabs)/create')}
          >
            <Text style={[styles.emptyBtnText, { color: theme.textOnPrimary }]}>Be the first to create one →</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

export default function DiscoverScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { isLandscape } = useOrientation();
  const instrument = useAuthStore((s) => s.selectedInstrumentSlug);
  const level = useAuthStore((s) => s.selectedLevelSlug);
  const [activeTag, setActiveTag] = useState('All');
  const { course: featuredCourse, loading: featuredLoading } = useFeaturedCourse();
  const { courses, loading: coursesLoading } = useCourses(
    instrument ?? undefined,
    level ?? undefined
  );

  const header = (
    <>
      <View style={[styles.headerRow, { backgroundColor: theme.background }]}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Discover 🎵</Text>
      </View>
      <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name="search-outline" size={16} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.textSecondary }]}
          placeholder="Songs, artists, instruments..."
          placeholderTextColor={theme.textDisabled}
          editable={false}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsRow}>
        {TAGS.map((tag) => (
          <TouchableOpacity
            key={tag}
            onPress={() => setActiveTag(tag)}
            style={[
              styles.tag,
              {
                backgroundColor: activeTag === tag ? theme.primary : theme.surface,
                borderColor: activeTag === tag ? theme.primary : theme.border,
              },
            ]}
          >
            <Text style={[styles.tagText, { color: activeTag === tag ? theme.textOnPrimary : theme.textSecondary }]}>
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );

  if (isLandscape) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }, Platform.OS === 'web' && { maxWidth: WEB_CONTENT_MAX }]}>
        <View style={styles.landscapeRow}>
          <View style={{ flex: 0.45 }}>
            {header}
          </View>
          <ScrollView style={{ flex: 0.55 }} contentContainerStyle={{ paddingBottom: Spacing.xxxl }}>
            <ContentArea
              theme={theme}
              router={router}
              featuredCourse={featuredCourse}
              featuredLoading={featuredLoading}
              courses={courses}
              coursesLoading={coursesLoading}
            />
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.xxxl }}>
        {header}
        <ContentArea
          theme={theme}
          router={router}
          featuredCourse={featuredCourse}
          featuredLoading={featuredLoading}
          courses={courses}
          coursesLoading={coursesLoading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  landscapeRow: { flex: 1, flexDirection: 'row' },
  headerRow: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.sm,
  },
  tagsRow: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  tagText: { fontSize: FontSize.sm, fontWeight: '500' },
  hero: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    aspectRatio: 16 / 9,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroGradient: { zIndex: 1 },
  heroPlay: { zIndex: 2 },
  heroInfo: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 2,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  heroSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700' },
  seeAll: { fontSize: FontSize.sm, fontWeight: '500' },
  lessonCard: {
    width: 140,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  lessonCardThumb: {
    width: 140,
    height: 90,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  lessonCardInfo: {
    padding: 6,
    gap: 2,
  },
  lessonCardTitle: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },
  lessonCardSub: {
    fontSize: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    gap: Spacing.md,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700' },
  emptyBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
  emptyBtnText: { fontSize: FontSize.md, fontWeight: '600' },
});
