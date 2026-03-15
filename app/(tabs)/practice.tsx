import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenGradient } from '@/src/components/common/ScreenGradient';
import { BottomTabBar } from '@/src/components/ui';
import { Colors, TextPresets, CommonStyles } from '@/src/constants/theme';

export default function LearnScreen() {
  return (
    <ScreenGradient style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Ionicons name="musical-notes" size={64} color={Colors.textPrimary} style={styles.icon} />
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
  icon: {
    marginBottom: 16,
  },
  title: {
    ...TextPresets.displayMd,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...TextPresets.bodyLg,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
