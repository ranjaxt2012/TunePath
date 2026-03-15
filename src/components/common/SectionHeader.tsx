import { StyleSheet, Text } from 'react-native';
import { Typography } from '@/src/constants/theme';
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
    fontFamily: Typography.semiBold,
    color: DesignSystem.colors.white,
    marginBottom: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.xl,
  },
});
