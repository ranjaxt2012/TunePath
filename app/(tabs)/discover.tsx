import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme, Spacing, FontSize } from '@/src/design';
import { useLessons } from '@/src/hooks/useLessons';
import { BASE_URL } from '@/src/services/api';
import { useOrientation } from '@/src/hooks/useOrientation';
import { LessonCard } from '@/src/components/ui/LessonCard';
import { TagChip } from '@/src/components/ui/TagChip';
import { SectionHeader } from '@/src/components/ui/SectionHeader';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { LoadingCard } from '@/src/components/ui/LoadingCard';
import { Log } from '@/src/utils/log';

const WEB_CONTENT_MAX = 960;

const TAGS = ['All', 'Harmonium', 'Guitar', 'Piano', 'Tabla', 'Classical', 'Folk', 'Bollywood'];

export default function DiscoverScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { isLandscape } = useOrientation();
  const [activeTag, setActiveTag] = useState('All');

  const instrument = activeTag === 'All' ? undefined : activeTag.toLowerCase();
  const { lessons, loading, error, refetch } = useLessons({ instrument });

  const showEmpty = !loading && (error !== null || lessons.length === 0);
  const showError = !loading && error !== null;

  useEffect(() => {
    Log.ui('discover mounted');
    Log.api('fetching lessons', { BASE_URL });
  }, []);

  useEffect(() => {
    if (!loading) {
      Log.api('lessons result', { count: lessons?.length ?? 0, error });
    }
  }, [loading, lessons?.length, error]);

  const headerAndSearch = (
    <View>
      <Text style={[styles.title, { color: theme.textPrimary }]}>Discover 🎵</Text>
      <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.searchIcon, { color: theme.textSecondary }]}>🔍</Text>
        <Text style={[styles.searchPlaceholder, { color: theme.textDisabled }]}>
          Search songs, artists...
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagRow}
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
    </View>
  );

  const content = showEmpty ? (
    showError ? (
      <EmptyState
        emoji="⚠️"
        title="Something went wrong"
        subtitle={error ?? 'Failed to load lessons'}
        actionLabel="Retry"
        onAction={refetch}
      />
    ) : (
      <EmptyState
        emoji="🎵"
        title="No lessons yet"
        subtitle="Check back soon!"
        actionLabel="Create one"
        onAction={() => router.push('/(tabs)/create' as any)}
      />
    )
  ) : (
    <View>
      {/* Featured hero */}
      {!loading && lessons[0] && (
        <View style={styles.featuredContainer}>
          <LessonCard
            lesson={lessons[0]}
            size="featured"
            onPress={() => router.push(`/lesson/${lessons[0].id}` as any)}
          />
        </View>
      )}
      {loading && (
        <View style={styles.featuredContainer}>
          <LoadingCard width={undefined} />
        </View>
      )}

      {/* Trending */}
      <SectionHeader title="Trending" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalRow}
      >
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <LoadingCard key={i} width={140} />)
          : lessons.slice(1, 6).map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                size="mini"
                onPress={() => router.push(`/lesson/${lesson.id}` as any)}
              />
            ))}
      </ScrollView>

      {/* New Lessons */}
      <SectionHeader title="New Lessons" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalRow}
      >
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <LoadingCard key={i} width={140} />)
          : lessons.slice(6, 12).map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                size="mini"
                onPress={() => router.push(`/lesson/${lesson.id}` as any)}
              />
            ))}
      </ScrollView>
    </View>
  );

  const containerStyle = [
    styles.container,
    { backgroundColor: theme.background },
    Platform.OS === 'web' && styles.webContainer,
  ];

  if (isLandscape) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
        <View
          style={[
            styles.landscapeWrapper,
            Platform.OS === 'web' && styles.webContainer,
          ]}
        >
          <View style={styles.landscapeLeft}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.padded}>
              {headerAndSearch}
            </ScrollView>
          </View>
          <View style={styles.landscapeRight}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.padded}>
              {content}
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={containerStyle}
        showsVerticalScrollIndicator={false}
      >
        {headerAndSearch}
        {content}
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
    fontSize: FontSize.hero,
    fontWeight: 'bold',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  searchIcon: {
    fontSize: FontSize.md,
  },
  searchPlaceholder: {
    fontSize: FontSize.md,
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  featuredContainer: {
    marginBottom: Spacing.md,
  },
  featuredLoading: {
    height: 220,
    borderRadius: 16,
  },
  horizontalRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  miniCard: {
    width: 140,
    height: 120,
    borderRadius: 12,
  },
  padded: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  landscapeWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  landscapeLeft: {
    flex: 0.4,
  },
  landscapeRight: {
    flex: 0.6,
  },
});
