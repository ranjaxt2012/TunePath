import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/design';

export default function LearningScreen() {
  const { theme } = useTheme();
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Text style={[styles.text, { color: theme.textPrimary }]}>
        Learning 📚
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 24, fontWeight: '700' },
});
