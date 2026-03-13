import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenGradient } from '@/src/components/common/ScreenGradient';
import { BottomTabBar } from '@/src/components/ui';
import { Colors, Typography, CommonStyles } from '@/src/constants/theme';

export default function LearnScreen() {
  return (
    <ScreenGradient style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.emoji}>🎵</Text>
          <Text style={styles.title}>Learn</Text>
          <Text style={styles.subtitle}>
            {'Coming soon — structured lessons,\nguided practice, and more.'}
          </Text>
        </View>
      </SafeAreaView>
      <BottomTabBar activeTab="practice" />
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    ...CommonStyles.screen,
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    ...Typography.displayMd,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...Typography.bodyLg,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
