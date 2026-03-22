import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useTheme,
  STANDARD_THEMES,
  ThemeId,
  Spacing,
  FontSize,
  Radius,
} from '@/src/design';
import { useAuthStore } from '@/src/store/authStore';
import {
  getPreferences,
  patchPreferences,
} from '@/src/services/apiClient';

const INSTRUMENTS = [
  { id: 'harmonium', label: 'Harmonium', emoji: '🪗' },
  { id: 'guitar', label: 'Guitar', emoji: '🎸' },
  { id: 'piano', label: 'Piano', emoji: '🎹' },
  { id: 'tabla', label: 'Tabla', emoji: '🥁' },
  { id: 'violin', label: 'Violin', emoji: '🎻' },
  { id: 'other', label: 'Other', emoji: '🎵' },
];

const LEVELS = [
  { id: 'beginner', label: 'Beginner', emoji: '🌱', desc: 'Just starting out' },
  { id: 'intermediate', label: 'Intermediate', emoji: '🎵', desc: 'Know the basics' },
  { id: 'advanced', label: 'Advanced', emoji: '🏆', desc: 'Ready to master' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [step, setStep] = useState(0);
  const [selectedInstrument, setInstrument] = useState('harmonium');
  const [selectedLevel, setLevel] = useState('beginner');

  const handleComplete = async () => {
    useAuthStore.getState().setSelectedInstrument(selectedInstrument);
    useAuthStore.getState().setSelectedLevel(selectedLevel);
    useAuthStore.getState().setHasOnboarded(true);
    try {
      const current = await getPreferences();
      await patchPreferences({ ...current });
    } catch {
      // silent — preferences saved locally
    }
    router.replace('/(tabs)/discover');
  };

  return (
    <LinearGradient
      colors={theme.gradient}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe}>

        {/* Progress dots */}
        <View style={styles.dots}>
          {[0, 1, 2].map(i => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === step
                    ? theme.textPrimary
                    : theme.textDisabled,
                  width: i === step ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Step 0: Theme picker */}
        {step === 0 && (
          <View style={styles.stepContent}>
            <Text style={styles.emoji}>🎨</Text>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              Your TunePath,{'\n'}your color
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Pick a theme that feels like you.{'\n'}
              Change it anytime in settings.
            </Text>
            <View style={styles.swatches}>
              {STANDARD_THEMES.map(t => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setTheme(t.id as ThemeId)}
                  style={[
                    styles.swatch,
                    { backgroundColor: t.primary },
                    theme.id === t.id && styles.swatchSelected,
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.selectedLabel, { color: theme.textSecondary }]}>
              {theme.label} selected ✓
            </Text>
          </View>
        )}

        {/* Step 1: Instrument picker */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.emoji}>🎵</Text>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              What do you play?
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              We'll show you the best lessons{'\n'}for your instrument.
            </Text>
            <View style={styles.instrGrid}>
              {INSTRUMENTS.map(inst => (
                <TouchableOpacity
                  key={inst.id}
                  onPress={() => setInstrument(inst.id)}
                  style={[
                    styles.instrCard,
                    {
                      backgroundColor:
                        selectedInstrument === inst.id
                          ? theme.primary
                          : theme.surface,
                      borderColor:
                        selectedInstrument === inst.id
                          ? theme.primary
                          : theme.border,
                    },
                  ]}
                >
                  <Text style={styles.instrEmoji}>{inst.emoji}</Text>
                  <Text style={[styles.instrLabel, { color: theme.textPrimary }]}>
                    {inst.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 2: Level picker */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.emoji}>📊</Text>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              How experienced{'\n'}are you?
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              We'll match the right lessons{'\n'}to your level.
            </Text>
            <View style={styles.levelGrid}>
              <View style={styles.levelTopRow}>
                {LEVELS.slice(0, 2).map(lvl => (
                  <TouchableOpacity
                    key={lvl.id}
                    onPress={() => setLevel(lvl.id)}
                    style={[
                      styles.levelCard,
                      styles.levelCardHalf,
                      {
                        backgroundColor:
                          selectedLevel === lvl.id
                            ? theme.primary
                            : theme.surface,
                        borderColor:
                          selectedLevel === lvl.id
                            ? theme.primary
                            : theme.border,
                      },
                    ]}
                  >
                    <Text style={styles.levelEmoji}>{lvl.emoji}</Text>
                    <Text style={[styles.levelLabel, { color: theme.textPrimary }]}>
                      {lvl.label}
                    </Text>
                    <Text style={[styles.levelDesc, { color: theme.textSecondary }]}>
                      {lvl.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                onPress={() => setLevel(LEVELS[2].id)}
                style={[
                  styles.levelCard,
                  styles.levelCardFull,
                  {
                    backgroundColor:
                      selectedLevel === 'advanced'
                        ? theme.primary
                        : theme.surface,
                    borderColor:
                      selectedLevel === 'advanced'
                        ? theme.primary
                        : theme.border,
                  },
                ]}
              >
                <Text style={styles.levelEmoji}>{LEVELS[2].emoji}</Text>
                <Text style={[styles.levelLabel, { color: theme.textPrimary }]}>
                  {LEVELS[2].label}
                </Text>
                <Text style={[styles.levelDesc, { color: theme.textSecondary }]}>
                  {LEVELS[2].desc}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Navigation buttons */}
        <View style={styles.btnRow}>
          {step > 0 && (
            <TouchableOpacity
              onPress={() => setStep(s => s - 1)}
              style={[styles.backBtn, { borderColor: theme.border }]}
            >
              <Text style={[styles.backBtnText, { color: theme.textSecondary }]}>
                Back
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => {
              if (step < 2) {
                setStep(s => s + 1);
              } else {
                handleComplete();
              }
            }}
            style={[styles.continueBtn, { backgroundColor: theme.primary }]}
          >
            <Text style={[styles.continueBtnText, { color: theme.textOnPrimary }]}>
              {step === 2 ? "Let's go 🎵" : 'Continue →'}
            </Text>
          </TouchableOpacity>
        </View>

        {step === 0 && (
          <TouchableOpacity onPress={handleComplete} style={styles.skipBtn}>
            <Text style={[styles.skipText, { color: theme.textDisabled }]}>
              Skip for now
            </Text>
          </TouchableOpacity>
        )}

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  dots: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  dot: {
    height: 8,
    borderRadius: Radius.full,
  },
  stepContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  emoji: { fontSize: 48 },
  title: {
    fontSize: FontSize.hero,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 38,
  },
  subtitle: {
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  swatches: {
    flexDirection: 'row',
    gap: Spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.15 }],
  },
  selectedLabel: {
    fontSize: FontSize.sm,
  },
  instrGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'center',
    width: '100%',
  },
  instrCard: {
    width: '45%',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  instrEmoji: { fontSize: 32 },
  instrLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  levelGrid: {
    width: '100%',
    gap: Spacing.md,
  },
  levelTopRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  levelCard: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  levelCardHalf: { flex: 1 },
  levelCardFull: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  levelEmoji: { fontSize: 28 },
  levelLabel: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  levelDesc: {
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.xl,
  },
  backBtn: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  continueBtn: {
    flex: 2,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  continueBtnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  skipBtn: {
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  skipText: {
    fontSize: FontSize.sm,
  },
});
