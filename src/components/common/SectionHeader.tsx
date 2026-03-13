import { StyleSheet, Text } from 'react-native';
import { DesignSystem } from '@/src/styles/theme';

interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <Text style={styles.title}>{title}</Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: DesignSystem.colors.white,
    marginBottom: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.xl,
  },
});
