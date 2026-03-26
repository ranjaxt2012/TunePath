import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { useTheme, Spacing, FontSize, Radius } from '@/src/design';
import { api, setAuthToken } from '@/src/services/api';
import { LessonCard } from '@/src/components/ui/LessonCard';
import { TagChip } from '@/src/components/ui/TagChip';
import { SectionHeader } from '@/src/components/ui/SectionHeader';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { LoadingCard } from '@/src/components/ui/LoadingCard';
import { Log } from '@/src/utils/log';
import type { Lesson } from '@/src/types/models';

const WEB_CONTENT_MAX = 960;

const TAGS = [
  'All',
  'Harmonium 🪗',
  'Guitar 🎸',
  'Piano 🎹',
  'Tabla 🥁',
  'Classical',
  'Folk',
  'Bollywood',
  'Devotional',
];

function tagToSlug(tag: string): string | undefined {
  if (tag === 'All') return undefined;
  return tag.replace(/\s*[\u{1F300}-\u{1FAFF}]/gu, '').trim().toLowerCase();
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function DiscoverScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  useEffect(() => { getTokenRef.current = getToken; }, [getToken]);
  const isWeb = Platform.OS === 'web';

  // ── Single fetch, single loading flag ──────────────────────────────────────
  const [trending, setTrending] = useState<Lesson[]>([]);
  const [newLessons, setNewLessons] = useState<Lesson[]>([]);
  const [harmonium, setHarmonium] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  // Prevents concurrent fetches — guards against React StrictMode double-invoke
  // and useFocusEffect firing on the same frame as initial mount.
  const fetchInFlightRef = useRef(false);
  // True once the first successful fetch completes — used to skip loading shimmer on re-fetches.
  const hasLoadedRef = useRef(false);

  const fetchAll = useCallback(async (force = false) => {
    if (fetchInFlightRef.current && !force) return;
    fetchInFlightRef.current = true;
    // Only show the full loading shimmer on the very first load.
    if (!hasLoadedRef.current) setLoading(true);
    setFetchError(null);
    try {
      const token = await getTokenRef.current();
      setAuthToken(token);
      const [t, n, h] = await Promise.all([
        api.get<Lesson[]>('/api/lessons?sort=trending&limit=10'),
        api.get<Lesson[]>('/api/lessons?sort=new&limit=10'),
        api.get<Lesson[]>('/api/lessons?instrument=harmonium&limit=10'),
      ]);
      setTrending(t);
      setNewLessons(n);
      setHarmonium(h);
      hasLoadedRef.current = true;
      Log.api('discover fetch ok', { trending: t.length, new: n.length, harmonium: h.length });
    } catch (err: unknown) {
      Log.apiError('discover fetch failed', err);
      setFetchError((err as Error)?.message ?? 'Failed to load lessons');
    } finally {
      setLoading(false);
      fetchInFlightRef.current = false;
    }
  }, []);

  // Single effect handles both initial load and re-fetch on focus (e.g. after delete).
  // Empty deps — fetchAll is stable (uses getTokenRef internally), so this never re-fires
  // due to a render cycle, only when the screen comes into focus.
  useFocusEffect(
    useCallback(() => {
      void fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  // ── Client-side tag filter (no re-fetch) ───────────────────────────────────
  const [activeTag, setActiveTag] = useState('All');
  const activeSlug = tagToSlug(activeTag);

  const filteredTrending = useMemo(() => {
    if (!activeSlug) return trending;
    return trending.filter(
      (l) => l.instrument_slug === activeSlug || l.tags?.includes(activeSlug)
    );
  }, [activeSlug, trending]);

  const filteredNew = useMemo(() => {
    if (!activeSlug) return newLessons;
    return newLessons.filter(
      (l) => l.instrument_slug === activeSlug || l.tags?.includes(activeSlug)
    );
  }, [activeSlug, newLessons]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const featuredLesson = filteredTrending[0] ?? null;
  const cardWidth = isWeb ? 220 : 140;
  const thumbHeight = isWeb ? 124 : 90;
  const hPad = isWeb ? Spacing.xl : Spacing.lg;

  // ── Stable onPress callbacks ───────────────────────────────────────────────
  const handleFeaturedPress = useCallback(() => {
    if (featuredLesson) router.push(`/lesson/${featuredLesson.id}`);
  }, [featuredLesson, router]);

  const handleCreatePress = useCallback(() => {
    router.push('/(tabs)/create');
  }, [router]);

  const handleRetry = useCallback(() => {
    void fetchAll(true); // force = true bypasses in-flight guard
  }, [fetchAll]);

  // ── Error state ────────────────────────────────────────────────────────────
  if (!loading && fetchError) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
        <EmptyState
          emoji="⚠️"
          title="Something went wrong"
          subtitle={fetchError}
          actionLabel="Retry"
          onAction={handleRetry}
        />
      </SafeAreaView>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!loading && trending.length === 0) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
        <EmptyState
          emoji="🎵"
          title="No lessons yet 🎵"
          subtitle="Be the first to create one"
          actionLabel="Create"
          onAction={handleCreatePress}
        />
      </SafeAreaView>
    );
  }

  const containerStyle = [
    styles.container,
    isWeb && { maxWidth: WEB_CONTENT_MAX, alignSelf: 'center' as const, width: '100%' as const },
  ];

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={containerStyle}>

          {/* ── Title ── */}
          <Text style={[styles.title, { color: theme.textPrimary, paddingHorizontal: hPad }]}>
            Discover 🎵
          </Text>

          {/* ── Tag chips ── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.tagRow, { paddingHorizontal: hPad }]}
          >
            {TAGS.map((tag) => (
              <TagChip
                key={tag}
                label={tag}
                active={activeTag === tag}
                onPress={() => setActiveTag(tag)}
              />
            ))}
          </ScrollView>

          {/* ── Featured hero ── */}
          <View style={[styles.heroWrapper, { paddingHorizontal: hPad }]}>
            {loading ? (
              <View
                style={[
                  styles.heroShimmer,
                  {
                    backgroundColor: theme.surfaceHigh,
                    aspectRatio: isWeb ? 16 / 6 : 16 / 9,
                    borderRadius: Radius.lg,
                  },
                ]}
              />
            ) : featuredLesson ? (
              <TouchableOpacity
                style={[
                  styles.heroCard,
                  { aspectRatio: isWeb ? 16 / 6 : 16 / 9, borderRadius: Radius.lg },
                ]}
                onPress={handleFeaturedPress}
                activeOpacity={0.9}
              >
                {featuredLesson.thumbnail_url ? (
                  <Image
                    source={{ uri: featuredLesson.thumbnail_url }}
                    style={StyleSheet.absoluteFillObject}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.surfaceHigh }]} />
                )}

                <View style={[styles.heroDuration, { backgroundColor: theme.overlay }]}>
                  <Text style={[styles.heroDurationText, { color: theme.textOnPrimary }]}>
                    {formatDuration(featuredLesson.duration_seconds)}
                  </Text>
                </View>

                <View style={[styles.heroPlayBtn, {
                  backgroundColor: theme.textOnPrimary + '40',
                  borderColor: theme.textOnPrimary + '99',
                }]}
                >
                  <Ionicons name="play" size={FontSize.hero - 2} color={theme.textOnPrimary} style={{ marginLeft: Spacing.xs }} />
                </View>

                <LinearGradient
                  colors={['transparent', theme.overlay]}
                  style={styles.heroGradient}
                >
                  <View style={styles.heroMeta}>
                    {featuredLesson.level_slug && (
                      <View style={[styles.levelBadge, { backgroundColor: theme.primary }]}>
                        <Text style={[styles.levelText, { color: theme.textOnPrimary }]}>
                          {featuredLesson.level_slug}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.heroTitle, { color: theme.textOnPrimary }]} numberOfLines={2}>
                    {featuredLesson.title}
                  </Text>
                  <View style={styles.heroCreatorRow}>
                    <Text style={[styles.heroCreator, { color: theme.textOnPrimary + 'D9' }]} numberOfLines={1}>
                      {featuredLesson.creator_name ?? 'Unknown'}
                    </Text>
                    {featuredLesson.creator_verified && (
                      <Text style={[styles.verifiedDot, { color: theme.primary }]}> •</Text>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* ── Row 1: Trending 🔥 ── */}
          <SectionHeader title="Trending 🔥" onSeeAll={() => {}} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.rowContent, { paddingHorizontal: hPad }]}
          >
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <LoadingCard key={i} width={cardWidth} thumbHeight={thumbHeight} />
                ))
              : filteredTrending.slice(1).map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    size="mini"
                    width={cardWidth}
                    thumbHeight={thumbHeight}
                    onPress={() => router.push(`/lesson/${lesson.id}`)}
                  />
                ))}
          </ScrollView>

          {/* ── Row 2: New Lessons ✨ ── */}
          <SectionHeader title="New Lessons ✨" onSeeAll={() => {}} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.rowContent, { paddingHorizontal: hPad }]}
          >
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <LoadingCard key={i} width={cardWidth} thumbHeight={thumbHeight} />
                ))
              : filteredNew.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    size="mini"
                    width={cardWidth}
                    thumbHeight={thumbHeight}
                    onPress={() => router.push(`/lesson/${lesson.id}`)}
                  />
                ))}
          </ScrollView>

          {/* ── Row 3: Harmonium 🪗 ── */}
          <SectionHeader title="Harmonium 🪗" onSeeAll={() => {}} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.rowContent, { paddingHorizontal: hPad }]}
          >
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <LoadingCard key={i} width={cardWidth} thumbHeight={thumbHeight} />
                ))
              : harmonium.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    size="mini"
                    width={cardWidth}
                    thumbHeight={thumbHeight}
                    onPress={() => router.push(`/lesson/${lesson.id}`)}
                  />
                ))}
          </ScrollView>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xxxl },
  container: {},
  title: {
    fontSize: FontSize.hero,
    fontWeight: 'bold',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  tagRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
    paddingRight: Spacing.xl,
  },
  heroWrapper: { marginBottom: Spacing.lg },
  heroShimmer: { width: '100%' },
  heroCard: {
    width: '100%',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroDuration: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  heroDurationText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  heroPlayBtn: {
    width: Spacing.xxxl + Spacing.xl,
    height: Spacing.xxxl + Spacing.xl,
    borderRadius: (Spacing.xxxl + Spacing.xl) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  heroMeta: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  levelBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  levelText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  heroTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    lineHeight: FontSize.xl + Spacing.xs,
  },
  heroCreatorRow: { flexDirection: 'row', alignItems: 'center' },
  heroCreator: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  verifiedDot: { fontSize: FontSize.sm, fontWeight: '700' },
  rowContent: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
    paddingRight: Spacing.xl,
  },
});
