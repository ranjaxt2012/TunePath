import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, Spacing, Radius, FontSize } from '@/src/design';
import type { Workflow } from '@/src/types/models';

interface WorkflowPickerProps {
  workflows: Workflow[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const WORKFLOW_EMOJIS: Record<string, string> = {
  indian: '🎵',
  indian_punjabi: '🎵',
  western: '🎸',
};

export function WorkflowPicker({ workflows, selectedId, onSelect }: WorkflowPickerProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.row}>
      {workflows.map((wf) => {
        const selected = wf.id === selectedId;
        return (
          <TouchableOpacity
            key={wf.id}
            style={[
              styles.card,
              {
                flex: 1,
                borderColor: selected ? theme.primary : theme.surfaceHigh,
                backgroundColor: selected ? theme.primary + '15' : theme.surface,
              },
            ]}
            onPress={() => onSelect(wf.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.emoji}>{WORKFLOW_EMOJIS[wf.id] ?? '🎵'}</Text>
            <Text style={[styles.name, { color: selected ? theme.primary : theme.textPrimary }]}>
              {wf.display_name}
            </Text>
            <Text style={[styles.desc, { color: theme.textSecondary }]} numberOfLines={2}>
              {wf.description}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  card: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  emoji: {
    fontSize: FontSize.xl,
  },
  name: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  desc: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.sm + 2,
  },
});
