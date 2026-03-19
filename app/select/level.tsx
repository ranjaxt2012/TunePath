/**
 * Select Level Screen — horizontal level pills, Genre + Theme accordion panels.
 * Saves to Zustand + PATCH /api/users/preferences on Continue.
 */

import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenGradient } from '@/src/components/common/ScreenGradient';
import {
  FontSize,
  Radius,
  Spacing,
  Typography,
} from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useAuthStore } from '@/src/store/authStore';
import { useOrientation } from '@/src/hooks/useOrientation';
import { getPreferences, patchPreferences } from '@/src/services/apiClient';

const GENRES = [
  'Classical', 'Folk', 'Bollywood', 'Jazz', 'Blues', 'Pop', 'Rock', 'Devotional',
];

const THEMES = [
  { id: 'purple', label: 'Purple', color: '#7C3AED' },
  { id: 'midnight', label: 'Midnight', color: '#1E3A5F' },
  { id: 'saffron', label: 'Saffron', color: '#D97706' },
  { id: 'slate', label: 'Slate', color: '#334155' },
  { id: 'high-contrast', label: 'High Contrast', color: '#000000' },
] as const;

export default function SelectLevelScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const {
    user,
    setSelectedLevel,
    setGenres,
    setTheme,
    selectedGenres,
    selectedTheme,
    selectedLevelSlug,
  } = useAuthStore();
  const { isLandscape } = useOrientation();

  const [selectedSlug, setSelectedSlugState] = useState<string | null>(
    selectedLevelSlug
  );
  const [genres, setGenresState] = useState<string[]>(selectedGenres);
  const [selectedThemeId, setThemeState] = useState<string>(selectedTheme);
  const [openPanel, setOpenPanel] = useState<'genres' | 'theme' | null>(null);
  const [genreHeight, setGenreHeight] = useState(0);
  const [themeHeight, setThemeHeight] = useState(0);
  const genreAnim = useRef(new Animated.Value(0)).current;
  const themeAnim = useRef(new Animated.Value(0)).current;

  // Sync from authStore on mount (returning user)
  useEffect(() => {
    setSelectedSlugState(selectedLevelSlug);
    setGenresState(selectedGenres);
    setThemeState(selectedTheme);
  }, [selectedLevelSlug, selectedGenres, selectedTheme]);

  // Fetch preferences from API on mount when authenticated
  useEffect(() => {
    getPreferences().then((p) => {
      setGenresState(p.preferred_genres);
      setThemeState(p.preferred_theme);
      setGenres(p.preferred_genres);
      setTheme(p.preferred_theme);
    }).catch(() => {});
  }, [setGenres, setTheme]);

  const handleLevelSelect = useCallback((slug: string) => {
    setSelectedSlugState(slug);
  }, []);

  const toggleGenres = useCallback(() => {
    const next = openPanel === 'genres' ? null : 'genres';
    setOpenPanel(next);
    Animated.spring(genreAnim, {
      toValue: next === 'genres' ? 1 : 0,
      useNativeDriver: false,
      tension: 70,
      friction: 12,
    }).start();
    Animated.spring(themeAnim, {
      toValue: 0,
      useNativeDriver: false,
      tension: 70,
      friction: 12,
    }).start();
  }, [openPanel, genreAnim, themeAnim]);

  const toggleTheme = useCallback(() => {
    const next = openPanel === 'theme' ? null : 'theme';
    setOpenPanel(next);
    Animated.spring(themeAnim, {
      toValue: next === 'theme' ? 1 : 0,
      useNativeDriver: false,
      tension: 70,
      friction: 12,
    }).start();
    Animated.spring(genreAnim, {
      toValue: 0,
      useNativeDriver: false,
      tension: 70,
      friction: 12,
    }).start();
  }, [openPanel, genreAnim, themeAnim]);

  const handleGenreTap = useCallback((g: string) => {
    setGenresState((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  }, []);

  const handleThemeSelect = useCallback((id: string) => {
    setThemeState(id);
  }, []);

  const handleContinue = useCallback(async () => {
    if (!selectedSlug) return;
    setSelectedLevel(selectedSlug);
    setGenres(genres);
    setTheme(selectedThemeId);
    router.replace('/(tabs)/home' as Parameters<typeof router.replace>[0]);
    patchPreferences({
      preferred_genres: genres,
      preferred_theme: selectedThemeId,
    }).catch(() => {});
  }, [selectedSlug, genres, selectedThemeId, setSelectedLevel, setGenres, setTheme, router]);

  const onGenreLayout = useCallback((e: LayoutChangeEvent) => {
    setGenreHeight(e.nativeEvent.layout.height);
  }, []);

  const onThemeLayout = useCallback((e: LayoutChangeEvent) => {
    setThemeHeight(e.nativeEvent.layout.height);
  }, []);

  const genreHeightInterp = genreAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, genreHeight],
  });

  const themeHeightInterp = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, themeHeight],
  });

  return (
    <ScreenGradient style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backText, { color: theme.textPrimary }]}>← Back</Text>
        </Pressable>

        <Text style={[styles.title, { color: theme.textPrimary }]}>Select Your Level</Text>

        <View style={styles.levelRowTop}>
          <TouchableOpacity
            style={[
              styles.levelCard,
              styles.levelCardHalf,
              { backgroundColor: theme.cardBg },
              selectedSlug === 'beginner' && { backgroundColor: theme.bgPrimary, borderColor: theme.textPrimary },
            ]}
            onPress={() => handleLevelSelect('beginner')}
          >
            <Text style={styles.levelEmoji}>🌱</Text>
            <Text style={[styles.levelName, { color: theme.textPrimary }]}>Beginner</Text>
            <Text style={[styles.levelDesc, { color: theme.textSecondary }]}>Start from scratch</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.levelCard,
              styles.levelCardHalf,
              { backgroundColor: theme.cardBg },
              selectedSlug === 'intermediate' && { backgroundColor: theme.bgPrimary, borderColor: theme.textPrimary },
            ]}
            onPress={() => handleLevelSelect('intermediate')}
          >
            <Text style={styles.levelEmoji}>🎵</Text>
            <Text style={[styles.levelName, { color: theme.textPrimary }]}>Intermediate</Text>
            <Text style={[styles.levelDesc, { color: theme.textSecondary }]}>Build on basics</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.levelCard,
            styles.levelCardFull,
            { backgroundColor: theme.cardBg },
            selectedSlug === 'advanced' && { backgroundColor: theme.bgPrimary, borderColor: theme.textPrimary },
          ]}
          onPress={() => handleLevelSelect('advanced')}
        >
          <Text style={styles.levelEmoji}>🏆</Text>
          <Text style={[styles.levelName, { color: theme.textPrimary }]}>Advanced</Text>
          <Text style={[styles.levelDesc, { color: theme.textSecondary }]}>Master the instrument</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Select Genres and Theme</Text>
        <View style={styles.toggleRow}>
          <Pressable
            style={[
              styles.toggleBtn,
              openPanel === 'genres' && { backgroundColor: theme.bgPrimary },
            ]}
            onPress={toggleGenres}
          >
            <Text style={styles.toggleIcon}>🎵</Text>
            <Text style={[styles.toggleLabel, { color: theme.textPrimary }]}>Genres</Text>
          </Pressable>
          <Pressable
            style={[
              styles.toggleBtn,
              openPanel === 'theme' && { backgroundColor: theme.bgPrimary },
            ]}
            onPress={toggleTheme}
          >
            <Text style={styles.toggleIcon}>🎨</Text>
            <Text style={[styles.toggleLabel, { color: theme.textPrimary }]}>Theme</Text>
          </Pressable>
        </View>

        <View style={styles.accordionWrap}>
          <View style={styles.measureOffscreen}>
            <View onLayout={onGenreLayout}>
              <View style={styles.genreContent}>
                {GENRES.map((g) => (
                  <View key={g} style={styles.genreChipPlaceholder}>
                    <Text style={styles.genreChipText}>{g}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          <View style={styles.measureOffscreen}>
            <View onLayout={onThemeLayout}>
              <View style={styles.themeContent}>
                {THEMES.map((t) => (
                  <View key={t.id} style={styles.swatchWrap}>
                    <View style={[styles.swatchCircle, { backgroundColor: t.color }]} />
                  </View>
                ))}
              </View>
            </View>
          </View>
          <Animated.View style={[styles.accordion, { height: genreHeightInterp }]}>
            <View style={styles.genreContent}>
              {GENRES.map((g) => (
                <GenreChip
                  key={g}
                  label={g}
                  selected={genres.includes(g)}
                  onPress={() => handleGenreTap(g)}
                  themeObj={theme}
                />
              ))}
            </View>
          </Animated.View>
          <Animated.View style={[styles.accordion, { height: themeHeightInterp }]}>
            <View style={styles.themeContent}>
              {THEMES.map((t) => (
                <ThemeSwatch
                  key={t.id}
                  theme={t}
                  selected={selectedThemeId === t.id}
                  onPress={() => handleThemeSelect(t.id)}
                  themeObj={theme}
                />
              ))}
            </View>
          </Animated.View>
        </View>

        <View style={styles.spacer} />

        <Pressable
          style={[
            styles.continueBtn,
            { backgroundColor: theme.textPrimary },
            !selectedSlug && styles.continueBtnDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedSlug}
        >
          <Text style={[styles.continueText, { color: theme.bgPrimary }]}>Continue →</Text>
        </Pressable>

        <TouchableOpacity
          style={[styles.tutorBtn, { backgroundColor: theme.cardBg }]}
          onPress={() => router.push('/tutor/upload')}
        >
          <Ionicons
            name="cloud-upload-outline"
            size={22}
            color={theme.textPrimary}
          />
          <Text style={[styles.tutorBtnText, { color: theme.textPrimary }]}>Tutor Portal</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={theme.textSecondary}
          />
        </TouchableOpacity>
      </SafeAreaView>
    </ScreenGradient>
  );
}

function GenreChip({
  label,
  selected,
  onPress,
  themeObj,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  themeObj: any;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.08,
        useNativeDriver: true,
        tension: 200,
        friction: 8,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 8,
      }),
    ]).start();
    onPress();
  };
  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.genreChip,
          selected && { backgroundColor: themeObj.bgPrimary },
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text
          style={[
            styles.genreChipText,
            { color: selected ? themeObj.textPrimary : themeObj.textSecondary },
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

function ThemeSwatch({
  theme,
  selected,
  onPress,
  themeObj,
}: {
  theme: (typeof THEMES)[number];
  selected: boolean;
  onPress: () => void;
  themeObj: any;
}) {
  const isHighContrast = theme.id === 'high-contrast';
  return (
    <Pressable style={styles.swatchWrap} onPress={onPress}>
      <View
        style={[
          styles.swatchCircle,
          { backgroundColor: theme.color },
          isHighContrast && { borderColor: themeObj.textPrimary },
          selected && { borderColor: themeObj.textPrimary },
        ]}
      >
        {selected && (
          <Text style={[styles.swatchCheck, { color: themeObj.textPrimary }]}>✓</Text>
        )}
      </View>
      <Text style={[styles.swatchLabel, { color: themeObj.textSecondary }]}>{theme.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: Spacing.lg },
  backButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: 0,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: FontSize.md,
    fontFamily: Typography.semiBold,
  },
  title: {
    fontSize: FontSize.xxl,
    fontFamily: Typography.bold,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.lg,
  },
  levelRowTop: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  levelCard: {
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    gap: Spacing.sm,
  },
  levelCardHalf: {
    flex: 1,
    minHeight: 140,
  },
  levelCardFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.md,
  },
  levelCardSelected: {
    borderWidth: 2,
  },
  levelEmoji: {
    fontSize: 32,
  },
  levelName: {
    fontSize: FontSize.md,
    fontFamily: Typography.semiBold,
  },
  levelDesc: {
    fontFamily: Typography.regular,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontFamily: Typography.semiBold,
    marginBottom: Spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  toggleBtn: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.md,
  },
  toggleBtnActive: {
  },
  toggleIcon: { fontSize: 18 },
  toggleLabel: {
    fontSize: FontSize.sm,
    fontFamily: Typography.semiBold,
  },
  accordionWrap: {
    overflow: 'hidden',
  },
  measureOffscreen: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -9999,
    opacity: 0,
    pointerEvents: 'none',
  },
  accordion: {
    overflow: 'hidden',
  },
  genreChipPlaceholder: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  genreContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  genreChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  genreChipSelected: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  genreChipText: {
    fontSize: FontSize.sm,
    fontFamily: Typography.medium,
  },
  genreChipTextSelected: {
  },
  themeContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  swatchWrap: {
    alignItems: 'center',
  },
  swatchCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchCircleBorder: {
    borderWidth: 1,
  },
  swatchSelected: {
    borderWidth: 3,
  },
  swatchCheck: {
    fontSize: 20,
    fontFamily: Typography.bold,
  },
  swatchLabel: {
    fontSize: FontSize.xs,
    fontFamily: Typography.regular,
    marginTop: Spacing.xs,
  },
  spacer: { flex: 1 },
  continueBtn: {
    height: 52,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  continueBtnDisabled: {
    opacity: 0.4,
  },
  continueText: {
    fontSize: FontSize.md,
    fontFamily: Typography.semiBold,
  },
  tutorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  tutorBtnText: {
    flex: 1,
    fontFamily: Typography.semiBold,
    fontSize: FontSize.md,
  },
});
