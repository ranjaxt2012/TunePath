import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme, Spacing, Radius, FontSize } from '@/src/design';

interface TagChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

export function TagChip({ label, active = false, onPress }: TagChipProps) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: active ? theme.primary : theme.surface,
          borderColor: active ? theme.primary : theme.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.label, { color: active ? theme.textOnPrimary : theme.textSecondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 0.5,
  },
  label: { fontSize: FontSize.sm, fontWeight: '500' },
});
