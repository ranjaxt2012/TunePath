import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, ErrorState, LoadingState, ScreenGradient } from '@/src/components/common';
import { Colors, CommonStyles, Radius, Spacing, Typography } from '@/src/constants/theme';
import { useLevels } from '@/src/hooks/useLevels';
import { useAuthStore } from '@/src/store/authStore';

const LEVEL_ICONS: Record<string, string> = {
  beginner: '🌱',
  intermediate: '🌿',
  advanced: '🌳',
};

const LEVEL_SUBTITLES: Record<string, string> = {
  beginner: 'Just getting started',
  intermediate: 'Some experience',
  advanced: 'Confident player',
};

export default function SelectLevelScreen() {
  const router = useRouter();
  const { setSelectedLevel } = useAuthStore();
  const { levels, loading, error, refetch } = useLevels();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const handleLevelSelect = (slug: string) => {
    setSelectedSlug(slug);
    setSelectedLevel(slug);
    router.replace('/(tabs)/home' as any);
  };

  return (
    <ScreenGradient style={{ flex: 1 }}>
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>‹ Back</Text>
      </Pressable>

      <Text style={styles.title}>Choose Your Level</Text>
      <Text style={styles.subtitle}>How would you describe your experience?</Text>

      {loading ? (
        <LoadingState message="Loading levels..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : levels.length === 0 ? (
        <EmptyState title="No levels available" />
      ) : (
        <FlatList
          data={levels}
          keyExtractor={(item) => item.slug}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const isSelected = selectedSlug === item.slug;
            return (
              <Pressable
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => handleLevelSelect(item.slug)}
              >
                <Text style={styles.icon}>{LEVEL_ICONS[item.slug] ?? '🎵'}</Text>
                <View style={styles.cardText}>
                  <Text style={styles.levelName}>{item.name}</Text>
                  <Text style={styles.levelSubtitle}>
                    {LEVEL_SUBTITLES[item.slug] ?? ''}
                  </Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    ...CommonStyles.screen,
    paddingTop: Spacing.lg,
  },
  backButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    alignSelf: 'flex-start',
  },
  backText: {
    ...Typography.h2,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  title: {
    ...Typography.displayMd,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  subtitle: {
    ...Typography.bodyMd,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: 20,           // no token — between Spacing.lg(16) and Spacing.xl(24)
    borderWidth: 2,
    borderColor: Colors.transparent,
  },
  cardSelected: {
    ...CommonStyles.cardSelected,
  },
  icon: {
    fontSize: 36,
    marginRight: Spacing.lg,
  },
  cardText: {
    flex: 1,
  },
  levelName: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  levelSubtitle: {
    ...Typography.bodyMd,
    color: Colors.textSecondary,
  },
});
