import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Colors, TextPresets, Spacing } from '@/src/constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  icon?: IconName;
  title: string;
  subtitle?: string;
};

export function EmptyState({ icon = 'musical-notes', title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={Colors.textPrimary} style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
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
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...TextPresets.bodyMd,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
