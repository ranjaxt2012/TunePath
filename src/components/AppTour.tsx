import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Linking,
  Dimensions,
} from 'react-native';
import { useTheme, Spacing, Radius, FontSize } from '@/src/design';
import { useAuthStore } from '@/src/store/authStore';

const YOUTUBE_TUTORIAL_URL = '';

const STEPS = [
  { message: "Hi! I'm Tune 🎵\nLet me show you around in 60 seconds!", position: 'center' as const },
  { message: "This is Discover 🔍\nFind lessons from creators worldwide", position: 'bottom' as const },
  { message: "Search any song,\nartist or instrument here 🎸", position: 'top' as const },
  { message: "Tap any lesson\nto start learning 👆", position: 'center' as const },
  { message: "Watch the video\nand follow along 🎬", position: 'center' as const },
  { message: "These are Sargam notes 🎵\nThey highlight as music plays\nLike karaoke for instruments!", position: 'center' as const },
  { message: "Slow down the video\nwith this speed slider 🐢", position: 'bottom' as const },
  { message: "Tap + to share\nyour own music lessons 🎬", position: 'bottom' as const },
  { message: "Import any YouTube\nvideo as a lesson ▶", position: 'center' as const },
  { message: "Tap 💬 anytime\nI'm always here to help!", position: 'bottom' as const },
  { message: "You're all set! 🎉\nWant to see everything in detail?", position: 'center' as const, showYouTube: true },
];

export function AppTour() {
  const { theme } = useTheme();
  const hasOnboarded = useAuthStore((s) => s.hasOnboarded);
  const tourSeen = (useAuthStore((s) => s as any).tourSeen) as boolean | undefined;
  const setTourSeen = (useAuthStore((s) => s as any).setTourSeen) as ((v: boolean) => void) | undefined;
  const isSignedIn = useAuthStore((s) => !!s.user);

  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSignedIn && hasOnboarded && !tourSeen) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isSignedIn, hasOnboarded, tourSeen]);

  useEffect(() => {
    if (!visible) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -10, duration: 600, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [visible, bounce]);

  const handleClose = () => {
    setVisible(false);
    setTourSeen?.(true);
  };

  const currentStep = STEPS[step];
  const screenHeight = Dimensions.get('window').height;
  const isTop = currentStep.position === 'top';
  const isBottom = currentStep.position === 'bottom';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[
          styles.content,
          isTop && { justifyContent: 'flex-start', paddingTop: 80 },
          isBottom && { justifyContent: 'flex-end', paddingBottom: 120 },
          currentStep.position === 'center' && { justifyContent: 'center' },
        ]}>
          {/* Bot character */}
          <Animated.View
            style={[
              styles.bot,
              { backgroundColor: theme.primary, transform: [{ translateY: bounce }] },
            ]}
          >
            <Text style={styles.botEmoji}>🎵</Text>
          </Animated.View>

          {/* Speech bubble */}
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{currentStep.message}</Text>
          </View>

          {/* YouTube card for last step */}
          {(currentStep as any).showYouTube && YOUTUBE_TUTORIAL_URL && (
            <TouchableOpacity
              style={[styles.ytCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => Linking.openURL(YOUTUBE_TUTORIAL_URL)}
            >
              <Text style={[styles.ytTitle, { color: theme.textPrimary }]}>TunePath Complete Guide</Text>
              <Text style={[styles.ytLink, { color: theme.primary }]}>Watch on YouTube →</Text>
            </TouchableOpacity>
          )}

          {/* Step counter */}
          <Text style={styles.stepCount}>{step + 1} of {STEPS.length}</Text>

          {/* Navigation */}
          <View style={styles.navRow}>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.skipText}>Skip tour</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: theme.primary }]}
              onPress={() => {
                if (step < STEPS.length - 1) {
                  setStep((s) => s + 1);
                } else {
                  handleClose();
                }
              }}
            >
              <Text style={[styles.nextBtnText, { color: theme.textOnPrimary }]}>
                {step === STEPS.length - 1 ? 'Start Learning →' : 'Next →'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  bot: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botEmoji: { fontSize: 28 },
  bubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    maxWidth: 280,
  },
  bubbleText: {
    color: '#000000',
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  ytCard: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.sm,
    width: 240,
  },
  ytTitle: { fontSize: FontSize.sm, fontWeight: '600', textAlign: 'center' },
  ytLink: { fontSize: FontSize.sm, fontWeight: '700' },
  stepCount: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: FontSize.xs,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
    marginTop: Spacing.sm,
  },
  skipText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: FontSize.sm,
  },
  nextBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
  nextBtnText: { fontSize: FontSize.md, fontWeight: '700' },
});
