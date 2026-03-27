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

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const YOUTUBE_TUTORIAL_URL = '';

const STEPS = [
  { message: "Hi! I'm Tune 🎵\nLet me show you around TunePath!", position: 'center' as const },
  { message: "Discover 🔍\nFind lessons from music teachers worldwide", position: 'bottom' as const },
  { message: "Search for any song,\nartist, or instrument 🎸", position: 'top' as const },
  { message: "Tap any lesson card\nto start learning! 👆", position: 'center' as const },
  { message: "Watch the video\nand follow along 🎬", position: 'center' as const },
  { message: "These are Sargam notes 🎵\nThey light up as music plays!\nLike karaoke for instruments!", position: 'center' as const },
  { message: "Slow down the video\nwith the speed slider 🐢", position: 'bottom' as const },
  { message: "Tap + to share\nyour own music lessons 🎬", position: 'bottom' as const },
  { message: "Import any YouTube video\nas a lesson ▶", position: 'center' as const },
  { message: "Tap 💬 anytime —\nI'm always here to help!", position: 'bottom' as const },
  { message: "You're all set! 🎉\nWant to see everything in detail?", position: 'center' as const, showYouTube: true },
] as const;

const TOTAL_STEPS = STEPS.length;

export function AppTour() {
  const { theme } = useTheme();
  const { isSignedIn, hasOnboarded, tourSeen, setTourSeen } = useAuthStore((s) => ({
    isSignedIn: !!s.user,
    hasOnboarded: s.hasOnboarded,
    tourSeen: s.tourSeen,
    setTourSeen: s.setTourSeen,
  }));

  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Show tour after 1000ms delay if conditions met
  useEffect(() => {
    if (isSignedIn && hasOnboarded && !tourSeen) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isSignedIn, hasOnboarded, tourSeen]);

  // Bounce animation loop
  useEffect(() => {
    if (!visible) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [visible, bounceAnim]);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      completeTour();
    }
  };

  const completeTour = () => {
    setTourSeen(true);
    setVisible(false);
  };

  const skipTour = () => {
    setTourSeen(true);
    setVisible(false);
  };

  const step = STEPS[currentStep];
  const isLastStep = currentStep === TOTAL_STEPS - 1;

  const getContentStyle = () => {
    switch (step.position) {
      case 'top':
        return { paddingTop: 80 };
      case 'bottom':
        return { paddingBottom: 120, justifyContent: 'flex-end' as const };
      case 'center':
      default:
        return { justifyContent: 'center' as const };
    }
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.overlay,
    },
    contentWrapper: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: Spacing.xl,
    },
    botCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
    },
    botEmoji: {
      fontSize: 28,
    },
    speechBubble: {
      backgroundColor: theme.modalBg,
      borderRadius: Radius.lg,
      padding: Spacing.lg,
      maxWidth: 280,
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    bubbleText: {
      color: theme.textPrimary,
      textAlign: 'center',
      lineHeight: FontSize.lg + Spacing.sm,
      fontSize: FontSize.md,
    },
    youtubeCard: {
      backgroundColor: theme.surface,
      borderRadius: Radius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      marginTop: Spacing.sm,
      borderWidth: 1,
      borderColor: theme.border,
    },
    youtubeText: {
      color: theme.primary,
      fontSize: FontSize.sm,
      fontWeight: '600',
    },
    stepCounter: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: FontSize.sm,
      marginBottom: Spacing.lg,
    },
    navRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    skipButton: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
    },
    skipText: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: FontSize.sm,
    },
    nextButton: {
      backgroundColor: theme.primary,
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.sm,
    },
    nextText: {
      color: theme.textOnPrimary,
      fontSize: FontSize.md,
      fontWeight: '600',
    },
  });

  const contentStyle = getContentStyle();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={skipTour}
    >
      <View style={styles.overlay}>
        <View style={[styles.contentWrapper, contentStyle]}>
          {/* Bouncing bot */}
          <Animated.View
            style={[
              styles.botCircle,
              { transform: [{ translateY: bounceAnim }] },
            ]}
          >
            <Text style={styles.botEmoji}>🎵</Text>
          </Animated.View>

          {/* Speech bubble */}
          <View style={styles.speechBubble}>
            <Text style={styles.bubbleText}>{step.message}</Text>

            {'showYouTube' in step && step.showYouTube && (
              <TouchableOpacity
                style={styles.youtubeCard}
                onPress={() => {
                  if (YOUTUBE_TUTORIAL_URL) {
                    Linking.openURL(YOUTUBE_TUTORIAL_URL);
                  }
                }}
                activeOpacity={0.75}
              >
                <Text style={styles.youtubeText}>Watch on YouTube →</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Step counter */}
          <Text style={styles.stepCounter}>
            {currentStep + 1} of {TOTAL_STEPS}
          </Text>

          {/* Navigation row */}
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.skipButton} onPress={skipTour}>
              <Text style={styles.skipText}>Skip tour</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.85}>
              <Text style={styles.nextText}>
                {isLastStep ? 'Start Learning →' : 'Next →'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default AppTour;
