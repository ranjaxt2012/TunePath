import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TextPresets, CommonStyles, Spacing } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

type Props = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({ message = 'Something went wrong.', onRetry }: Props) {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
          <Text style={[styles.retryText, { color: theme.textPrimary }]}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...CommonStyles.screen,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  icon: { fontSize: 40 },
  message: {
    ...TextPresets.bodyLg,
    textAlign: 'center',
  },
  retryBtn: {
    ...CommonStyles.ghostButton,
    marginTop: Spacing.md,
  },
  retryText: { ...CommonStyles.ghostButtonText },
});
