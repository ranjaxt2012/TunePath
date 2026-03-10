import { StyleSheet, Text, View } from 'react-native';
import { DesignSystem } from '../../styles/theme';

interface ProgressBadgeProps {
  progressPercent: number;
  label?: string;
}

export function ProgressBadge({ progressPercent, label }: ProgressBadgeProps) {
  const displayLabel = label ?? `${Math.round(progressPercent)}% complete`;
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{displayLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    paddingHorizontal: DesignSystem.spacing.md,
  },
  text: {
    fontSize: 14,
    color: DesignSystem.colors.whiteOverlay['70'],
  },
});
