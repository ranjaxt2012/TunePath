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
  Colors,
  FontSize,
  Radius,
  Spacing,
  Typography,
} from '@/src/constants/theme';
import { useAuthStore } from '@/src/store/authStore';
import { getPreferences, patchPreferences } from '@/src/services/apiClient';

const LEVELS = [
  { slug: 'beginner', name: 'Beginner', icon: '🌱' },
  { slug: 'intermediate', name: 'Intermediate', icon: '🎵' },
  { slug: 'advanced', name: 'Advanced', icon: '🏆' },
] as const;

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
  const {
    setSelectedLevel,
    setGenres,
    setTheme,
    selectedGenres,
    selectedTheme,
    selectedLevelSlug,
  } = useAuthStore();

  const [selectedSlug, setSelectedSlugState] = useState<string | null>(
    selectedLevelSlug
  );
  const [genres, setGenresState] = useState<string[]>(selectedGenres);
  const [theme, setThemeState] = useState<string>(selectedTheme);
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
    setTheme(theme);
    router.replace('/(tabs)/home' as Parameters<typeof router.replace>[0]);
    patchPreferences({
      preferred_genres: genres,
      preferred_theme: theme,
    }).catch(() => {});
  }, [selectedSlug, genres, theme, setSelectedLevel, setGenres, setTheme, router]);

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
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>Select Your Level</Text>

        <View style={styles.levelRow}>
          {LEVELS.map((level) => {
            const isSelected = selectedSlug === level.slug;
            return (
              <LevelPill
                key={level.slug}
                level={level}
                isSelected={isSelected}
                onPress={() => handleLevelSelect(level.slug)}
              />
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Select Genres and Theme</Text>
        <View style={styles.toggleRow}>
          <Pressable
            style={[
              styles.toggleBtn,
              openPanel === 'genres' && styles.toggleBtnActive,
            ]}
            onPress={toggleGenres}
          >
            <Text style={styles.toggleIcon}>🎵</Text>
            <Text style={styles.toggleLabel}>Genres</Text>
          </Pressable>
          <Pressable
            style={[
              styles.toggleBtn,
              openPanel === 'theme' && styles.toggleBtnActive,
            ]}
            onPress={toggleTheme}
          >
            <Text style={styles.toggleIcon}>🎨</Text>
            <Text style={styles.toggleLabel}>Theme</Text>
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
                  selected={theme === t.id}
                  onPress={() => handleThemeSelect(t.id)}
                />
              ))}
            </View>
          </Animated.View>
        </View>

        <View style={styles.spacer} />

        <Pressable
          style={[
            styles.continueBtn,
            !selectedSlug && styles.continueBtnDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedSlug}
        >
          <Text style={styles.continueText}>Continue →</Text>
        </Pressable>

        <TouchableOpacity
          style={styles.tutorBtn}
          onPress={() => router.push('/tutor/upload')}
        >
          <Ionicons
            name="cloud-upload-outline"
            size={20}
            color={Colors.textPrimary}
          />
          <Text style={styles.tutorBtnText}>Tutor Portal</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ScreenGradient>
  );
}

function LevelPill({
  level,
  isSelected,
  onPress,
}: {
  level: (typeof LEVELS)[number];
  isSelected: boolean;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.05 : 1,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, [isSelected, scaleAnim]);
  return (
    <Pressable onPress={onPress} style={styles.levelPillWrap}>
      <Animated.View
        style={[
          styles.levelPill,
          isSelected && styles.levelPillSelected,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={styles.levelIcon}>{level.icon}</Text>
        <Text style={styles.levelName} numberOfLines={1}>
          {level.name}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

function GenreChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
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
          selected && styles.genreChipSelected,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text
          style={[styles.genreChipText, selected && styles.genreChipTextSelected]}
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
}: {
  theme: (typeof THEMES)[number];
  selected: boolean;
  onPress: () => void;
}) {
  const isHighContrast = theme.id === 'high-contrast';
  return (
    <Pressable style={styles.swatchWrap} onPress={onPress}>
      <View
        style={[
          styles.swatchCircle,
          { backgroundColor: theme.color },
          isHighContrast && styles.swatchCircleBorder,
          selected && styles.swatchSelected,
        ]}
      >
        {selected && (
          <Text style={styles.swatchCheck}>✓</Text>
        )}
      </View>
      <Text style={styles.swatchLabel}>{theme.label}</Text>
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
    color: Colors.textPrimary,
  },
  title: {
    fontSize: FontSize.xxl,
    fontFamily: Typography.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.lg,
  },
  levelRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  levelPillWrap: {
    flex: 1,
    minWidth: 0,
  },
  levelPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.xl,
  },
  levelPillSelected: {
    backgroundColor: Colors.bgPrimary,
    borderWidth: 1.5,
    borderColor: Colors.textPrimary,
  },
  levelIcon: { fontSize: 24, marginBottom: Spacing.xs },
  levelName: {
    fontSize: FontSize.sm,
    fontFamily: Typography.semiBold,
    color: Colors.textPrimary,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontFamily: Typography.semiBold,
    color: Colors.textPrimary,
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
    backgroundColor: Colors.bgPrimary,
  },
  toggleIcon: { fontSize: 18 },
  toggleLabel: {
    fontSize: FontSize.sm,
    fontFamily: Typography.semiBold,
    color: Colors.textPrimary,
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
    backgroundColor: Colors.bgPrimary,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  genreChipText: {
    fontSize: FontSize.sm,
    fontFamily: Typography.medium,
    color: Colors.textSecondary,
  },
  genreChipTextSelected: {
    color: Colors.textPrimary,
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
    borderColor: Colors.textPrimary,
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: Colors.textPrimary,
  },
  swatchCheck: {
    fontSize: 20,
    fontFamily: Typography.bold,
    color: Colors.textPrimary,
  },
  swatchLabel: {
    fontSize: FontSize.xs,
    fontFamily: Typography.regular,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  spacer: { flex: 1 },
  continueBtn: {
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: Colors.textPrimary,
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
    color: Colors.bgPrimary,
  },
  tutorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    opacity: 0.7,
    marginBottom: Spacing.lg,
  },
  tutorBtnText: {
    fontFamily: Typography.medium,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
});
