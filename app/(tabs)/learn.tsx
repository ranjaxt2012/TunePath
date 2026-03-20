import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenGradient } from '@/src/components/common/ScreenGradient';
import { BottomTabBar } from '@/src/components/ui';
import { TextPresets, CommonStyles } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

export default function LearnScreen() {
  const { theme } = useTheme();
  return (
    <ScreenGradient style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Ionicons name="musical-notes" size={64} color={theme.textPrimary} style={styles.icon} />
          <Text style={[styles.title, { color: theme.textPrimary }]}>Learn</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {'Coming soon — structured lessons,\nguided practice, and more.'}
          </Text>
        </View>
      </SafeAreaView>
      <BottomTabBar activeTab="learn" />
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
  icon: {
    marginBottom: 16,
  },
  title: {
    ...TextPresets.displayMd,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...TextPresets.bodyLg,
    textAlign: 'center',
    lineHeight: 24,
  },
});
