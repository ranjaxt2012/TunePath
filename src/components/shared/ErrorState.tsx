import { StyleSheet, Text, View } from 'react-native';
import { DesignSystem } from '../../styles/theme';

interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: DesignSystem.spacing['2xl'],
    paddingHorizontal: DesignSystem.spacing.xl,
    alignItems: 'center',
  },
  text: {
    fontSize: 15,
    color: DesignSystem.colors.whiteOverlay['70'],
    textAlign: 'center',
  },
});
