import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Spacing, Radius, FontSize, THEMES, STANDARD_THEMES, ThemeId } from '@/src/design';
import { useAuthStore } from '@/src/store/authStore';

const INSTRUMENTS = [
  { slug: 'harmonium', emoji: '🎹', label: 'Harmonium' },
  { slug: 'guitar', emoji: '🎸', label: 'Guitar' },
  { slug: 'piano', emoji: '🎵', label: 'Piano' },
  { slug: 'tabla', emoji: '🥁', label: 'Tabla' },
  { slug: 'flute', emoji: '🎶', label: 'Flute' },
  { slug: 'sitar', emoji: '🎼', label: 'Sitar' },
];

const LEVELS = [
  { slug: 'beginner', emoji: '🌱', label: 'Beginner', desc: 'Just starting out' },
  { slug: 'intermediate', emoji: '🎯', label: 'Intermediate', desc: 'Some experience' },
  { slug: 'advanced', emoji: '🏆', label: 'Advanced', desc: 'Highly skilled' },
];

export default function OnboardingScreen() {
  const { theme, themeId, setTheme } = useTheme();
  const router = useRouter();
  const { setSelectedInstrument, setSelectedLevel, setHasOnboarded } = useAuthStore();

  const selectedTheme = themeId;

  const [step, setStep] = useState(0);
  const [selectedInstrumentSlug, setSelectedInstrumentSlug] = useState('');
  const [selectedLevelSlug, setSelectedLevelSlug] = useState('');

  const handleSkip = () => {
    setHasOnboarded(true);
    router.replace('/(tabs)/discover' as any);
  };

  const handleContinue = () => {
    if (step < 2) {
      setStep((s) => s + 1);
    } else {
      if (selectedInstrumentSlug) setSelectedInstrument(selectedInstrumentSlug);
      if (selectedLevelSlug) setSelectedLevel(selectedLevelSlug);
      setHasOnboarded(true);
      router.replace('/(tabs)/discover' as any);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const canContinue =
    step === 0 ||
    (step === 1 && selectedInstrumentSlug !== '') ||
    (step === 2 && selectedLevelSlug !== '');

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
      <View style={styles.flex}>
        {/* Skip button */}
        <View style={styles.topRow}>
          {step > 0 ? (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Text style={[styles.backText, { color: theme.textSecondary }]}>← Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backButton} />
          )}
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: theme.textSecondary }]}>Skip</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Step 0: Choose theme */}
          {step === 0 && (
            <View style={styles.stepContainer}>
              <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Pick your vibe 🎨</Text>
              <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
                Choose your app theme
              </Text>
              <View style={styles.themeGrid}>
                {STANDARD_THEMES.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setTheme(t.id)}
                    style={styles.themeSwatchWrapper}
                  >
                    <View
                      style={[
                        styles.themeSwatch,
                        { backgroundColor: t.primary, borderRadius: 28 },
                        selectedTheme === t.id && {
                          borderWidth: 3,
                          borderColor: theme.textPrimary,
                          transform: [{ scale: 1.15 }],
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.themeLabel,
                        {
                          color:
                            selectedTheme === t.id ? theme.textPrimary : theme.textSecondary,
                        },
                      ]}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 1: Choose instrument */}
          {step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>What do you play? 🎵</Text>
              <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
                We'll personalize your feed
              </Text>
              <View style={styles.instrumentGrid}>
                {INSTRUMENTS.map((inst) => {
                  const isSelected = selectedInstrumentSlug === inst.slug;
                  return (
                    <TouchableOpacity
                      key={inst.slug}
                      onPress={() => setSelectedInstrumentSlug(inst.slug)}
                      style={[
                        styles.instrumentCard,
                        {
                          backgroundColor: theme.surface,
                          borderRadius: Radius.lg,
                          borderWidth: isSelected ? 2 : 1,
                          borderColor: isSelected ? theme.primary : theme.border,
                        },
                      ]}
                    >
                      <Text style={styles.instrumentEmoji}>{inst.emoji}</Text>
                      <Text
                        style={[
                          styles.instrumentLabel,
                          { color: isSelected ? theme.primary : theme.textPrimary },
                        ]}
                      >
                        {inst.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Step 2: Choose level */}
          {step === 2 && (
            <View style={styles.stepContainer}>
              <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>What's your level? 🏆</Text>
              <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
                We'll recommend lessons to match
              </Text>
              <View style={styles.levelStack}>
                {LEVELS.map((level) => {
                  const isSelected = selectedLevelSlug === level.slug;
                  return (
                    <TouchableOpacity
                      key={level.slug}
                      onPress={() => setSelectedLevelSlug(level.slug)}
                      style={[
                        styles.levelCard,
                        {
                          backgroundColor: isSelected ? theme.primary : theme.surface,
                          borderRadius: Radius.lg,
                          borderWidth: isSelected ? 0 : 1,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <Text style={styles.levelEmoji}>{level.emoji}</Text>
                      <View style={styles.levelText}>
                        <Text
                          style={[
                            styles.levelLabel,
                            { color: isSelected ? theme.textOnPrimary : theme.textPrimary },
                          ]}
                        >
                          {level.label}
                        </Text>
                        <Text
                          style={[
                            styles.levelDesc,
                            {
                              color: isSelected
                                ? 'rgba(255,255,255,0.75)'
                                : theme.textSecondary,
                            },
                          ]}
                        >
                          {level.desc}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === step ? theme.primary : theme.border,
                  width: i === step ? 20 : 8,
                  borderRadius: 4,
                },
              ]}
            />
          ))}
        </View>

        {/* Continue button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              {
                backgroundColor: canContinue ? theme.primary : theme.surface,
                borderRadius: Radius.lg,
              },
            ]}
            onPress={handleContinue}
            disabled={!canContinue && step !== 0}
          >
            <Text
              style={[
                styles.continueText,
                {
                  color: canContinue ? theme.textOnPrimary : theme.textDisabled,
                },
              ]}
            >
              {step === 2 ? 'Get Started' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  backButton: {
    minWidth: 60,
  },
  backText: {
    fontSize: FontSize.md,
  },
  skipButton: {
    padding: Spacing.sm,
  },
  skipText: {
    fontSize: FontSize.md,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  stepContainer: {
    gap: Spacing.xl,
  },
  stepTitle: {
    fontSize: FontSize.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  stepSubtitle: {
    fontSize: FontSize.md,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  themeSwatchWrapper: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  themeSwatch: {
    width: 56,
    height: 56,
  },
  themeLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  instrumentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'center',
  },
  instrumentCard: {
    width: '45%',
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  instrumentEmoji: {
    fontSize: FontSize.xxl + 6,
  },
  instrumentLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  levelStack: {
    gap: Spacing.md,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  levelEmoji: {
    fontSize: FontSize.xxl,
    width: 40,
    textAlign: 'center',
  },
  levelText: {
    flex: 1,
    gap: Spacing.xs,
  },
  levelLabel: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  levelDesc: {
    fontSize: FontSize.sm,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  dot: {
    height: 8,
  },
  bottomBar: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  continueButton: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  continueText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
});
