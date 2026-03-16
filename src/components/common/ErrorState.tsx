import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, TextPresets, CommonStyles, Spacing } from '@/src/constants/theme';

type Props = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({ message = 'Something went wrong.', onRetry }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
          <Text style={styles.retryText}>Try Again</Text>
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
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  retryBtn: {
    ...CommonStyles.ghostButton,
    marginTop: Spacing.md,
  },
  retryText: { ...CommonStyles.ghostButtonText },
});
