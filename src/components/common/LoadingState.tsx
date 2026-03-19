import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { TextPresets, CommonStyles } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

type Props = {
  message?: string;
};

export function LoadingState({ message = 'Loading...' }: Props) {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.textPrimary} />
      <Text style={[styles.text, { color: theme.textSecondary }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...CommonStyles.screen,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  text: {
    ...TextPresets.bodyMd,
  },
});
