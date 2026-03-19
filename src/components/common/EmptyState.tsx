import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { TextPresets, Spacing } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

type IconName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  icon?: IconName;
  title: string;
  subtitle?: string;
};

export function EmptyState({ icon = 'musical-notes', title, subtitle }: Props) {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={theme.textPrimary} style={styles.icon} />
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  icon: { marginBottom: Spacing.sm },
  title: {
    ...TextPresets.h2,
    textAlign: 'center',
  },
  subtitle: {
    ...TextPresets.bodyMd,
    textAlign: 'center',
  },
});
