import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState, ErrorState, InstrumentIcon, LoadingState, ScreenGradient } from '@/src/components/common';
import { Colors, CommonStyles, Layout, Radius, Spacing, TextPresets } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useInstruments } from '@/src/hooks/useInstruments';
import { useAuthStore } from '@/src/store/authStore';
import { useOrientation } from '@/src/hooks/useOrientation';
import { patchPreferences } from '@/src/services/apiClient';

const CARD_SIZE = Layout.cardHalf;

export default function SelectInstrumentScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { setSelectedInstrument } = useAuthStore();
  const { instruments, loading, error, refetch } = useInstruments();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const { isLandscape } = useOrientation();
  const numColumns = isLandscape ? 3 : 2;

  const handleInstrumentSelect = useCallback((slug: string) => {
    setSelectedSlug(slug);
    setSelectedInstrument(slug);
    // Save to backend
    patchPreferences({
      preferred_genres: useAuthStore.getState().selectedGenres || [],
      preferred_theme: useAuthStore.getState().selectedTheme,
    }).catch(() => {});
    router.push('/select/level' as any);
  }, [setSelectedInstrument, router]);

  return (
    <ScreenGradient style={styles.container}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>Choose Your Instrument</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Select your instrument to get started.</Text>

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
          numColumns={numColumns}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => {
            const isSelected = selectedSlug === item.slug;
            return (
              <Pressable
                style={[
                  styles.card,
                  { backgroundColor: theme.cardBg },
                  isSelected && { backgroundColor: theme.bgPrimary, borderColor: theme.textPrimary },
                ]}
                onPress={() => handleInstrumentSelect(item.slug)}
              >
                <View style={styles.icon}>
                  <InstrumentIcon slug={item.slug} size={36} />
                </View>
                <Text style={[styles.name, { color: theme.textPrimary }]}>{item.name}</Text>
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
    ...TextPresets.displayMd,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  subtitle: {
    ...TextPresets.bodyMd,
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
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    ...CommonStyles.cardSelected,
  },
  icon: {
    marginBottom: Spacing.sm,
  },
  name: {
    ...TextPresets.labelMd,
    textAlign: 'center',
  },
});
