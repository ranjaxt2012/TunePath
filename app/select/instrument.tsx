import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { EmptyState, ErrorState, LoadingState, ScreenGradient } from '@/src/components/common';
import { INSTRUMENT_ICONS } from '@/src/constants/instrumentIcons';
import { Colors, CommonStyles, Layout, Radius, Spacing, Typography } from '@/src/constants/theme';
import { useInstruments } from '@/src/hooks/useInstruments';
import { useAuthStore } from '@/src/store/authStore';

const CARD_SIZE = Layout.cardHalf;

export default function SelectInstrumentScreen() {
  const router = useRouter();
  const { setSelectedInstrument } = useAuthStore();
  const { instruments, loading, error, refetch } = useInstruments();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const handleInstrumentSelect = (slug: string) => {
    setSelectedSlug(slug);
    setSelectedInstrument(slug);
    router.push('/select/level' as any);
  };

  return (
    <ScreenGradient style={styles.container}>
      <Text style={styles.title}>Choose Your Instrument</Text>
      <Text style={styles.subtitle}>Select your instrument to get started.</Text>

      {loading ? (
        <LoadingState message="Loading instruments..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : instruments.length === 0 ? (
        <EmptyState title="No instruments available" />
      ) : (
        <FlatList
          data={instruments}
          keyExtractor={(item) => item.slug}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => {
            const isSelected = selectedSlug === item.slug;
            return (
              <Pressable
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => handleInstrumentSelect(item.slug)}
              >
                <Text style={styles.icon}>
                  {INSTRUMENT_ICONS[item.slug] ?? '🎵'}
                </Text>
                <Text style={styles.name}>{item.name}</Text>
              </Pressable>
            );
          }}
        />
      )}
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    ...CommonStyles.screen,
    paddingTop: Spacing.xxl,
  },
  title: {
    ...Typography.displayMd,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  subtitle: {
    ...Typography.bodyMd,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  grid: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  row: {
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.transparent,
  },
  cardSelected: {
    ...CommonStyles.cardSelected,
  },
  icon: {
    fontSize: 36,
    marginBottom: Spacing.sm,
  },
  name: {
    ...Typography.labelMd,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});
