import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Spacing, FontSize, Radius } from '@/src/design';
import { useLessons } from '@/src/hooks/useLessons';
import { BASE_URL } from '@/src/services/api';
import { LessonCard } from '@/src/components/ui/LessonCard';
import { TagChip } from '@/src/components/ui/TagChip';
import { SectionHeader } from '@/src/components/ui/SectionHeader';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { LoadingCard } from '@/src/components/ui/LoadingCard';
import { Log } from '@/src/utils/log';

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

// Map display tag label → instrument/tag query value
function tagToInstrument(tag: string): string | undefined {
  if (tag === 'All') return undefined;
  // Strip emoji and lowercase
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
  const isWeb = Platform.OS === 'web';
  const [activeTag, setActiveTag] = useState('All');

  const instrument = tagToInstrument(activeTag);

  // Three separate data fetches for three rows
  const {
    lessons: trending,
    loading: loadTrending,
    error: errorTrending,
    refetch: refetchTrending,
  } = useLessons({ sort: 'trending', limit: 10, instrument });

  const {
    lessons: newLessons,
    loading: loadNew,
    refetch: refetchNew,
  } = useLessons({ sort: 'new', limit: 10, instrument });

  const {
    lessons: harmonium,
    loading: loadHarmonium,
  } = useLessons({ instrument: 'harmonium', limit: 10 });

  const featured = trending[0];
  const cardWidth = isWeb ? 220 : 140;
  const thumbHeight = isWeb ? 124 : 90;

  const hPad = isWeb ? Spacing.xl : Spacing.lg;

  useEffect(() => {
    Log.ui('discover mounted');
    Log.api('fetching lessons', { BASE_URL });
  }, []);

  // Error state — show if trending fails (primary data source)
  if (!loadTrending && errorTrending) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
        <EmptyState
          emoji="⚠️"
          title="Something went wrong"
          subtitle={errorTrending ?? 'Failed to load lessons'}
          actionLabel="Retry"
          onAction={refetchTrending}
        />
      </SafeAreaView>
    );
  }

  // Empty state — no trending lessons and not loading
  if (!loadTrending && trending.length === 0 && !errorTrending) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
        <EmptyState
          emoji="🎵"
          title="No lessons yet 🎵"
          subtitle="Be the first to create one"
          actionLabel="Create"
          onAction={() => router.push('/(tabs)/create' as any)}
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
            {loadTrending ? (
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
            ) : featured ? (
              <TouchableOpacity
                style={[
                  styles.heroCard,
                  {
                    aspectRatio: isWeb ? 16 / 6 : 16 / 9,
                    borderRadius: Radius.lg,
                  },
                ]}
                onPress={() => router.push(`/lesson/${featured.id}` as any)}
                activeOpacity={0.9}
              >
                {/* Background */}
                {featured.thumbnail_url ? (
                  <Image
                    source={{ uri: featured.thumbnail_url }}
                    style={StyleSheet.absoluteFillObject}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.surfaceHigh }]} />
                )}

                {/* Duration badge */}
                <View style={[styles.heroDuration, { backgroundColor: theme.overlay }]}>
                  <Text style={[styles.heroDurationText, { color: '#FFFFFF' }]}>
                    {formatDuration(featured.duration_seconds)}
                  </Text>
                </View>

                {/* Center play button */}
                <View style={styles.heroPlayBtn}>
                  <Ionicons name="play" size={28} color="#FFFFFF" style={{ marginLeft: 3 }} />
                </View>

                {/* Bottom overlay */}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.heroGradient}
                >
                  <View style={styles.heroMeta}>
                    {featured.level_slug && (
                      <View style={[styles.levelBadge, { backgroundColor: theme.primary }]}>
                        <Text style={[styles.levelText, { color: theme.textOnPrimary }]}>
                          {featured.level_slug}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.heroTitle} numberOfLines={2}>{featured.title}</Text>
                  <View style={styles.heroCreatorRow}>
                    <Text style={styles.heroCreator} numberOfLines={1}>
                      {featured.creator_name ?? 'Unknown'}
                    </Text>
                    {featured.creator_verified && (
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
            {loadTrending
              ? Array.from({ length: 5 }).map((_, i) => (
                  <LoadingCard key={i} width={cardWidth} thumbHeight={thumbHeight} />
                ))
              : trending.slice(1).map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    size="mini"
                    width={cardWidth}
                    thumbHeight={thumbHeight}
                    onPress={() => router.push(`/lesson/${lesson.id}` as any)}
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
            {loadNew
              ? Array.from({ length: 5 }).map((_, i) => (
                  <LoadingCard key={i} width={cardWidth} thumbHeight={thumbHeight} />
                ))
              : newLessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    size="mini"
                    width={cardWidth}
                    thumbHeight={thumbHeight}
                    onPress={() => router.push(`/lesson/${lesson.id}` as any)}
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
            {loadHarmonium
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
                    onPress={() => router.push(`/lesson/${lesson.id}` as any)}
                  />
                ))}
          </ScrollView>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  container: {
    // max-width centering applied inline for web
  },
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
  heroWrapper: {
    marginBottom: Spacing.lg,
  },
  heroShimmer: {
    width: '100%',
  },
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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
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
    color: '#FFFFFF',
    lineHeight: 24,
  },
  heroCreatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroCreator: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  verifiedDot: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  rowContent: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
    paddingRight: Spacing.xl,
  },
});
