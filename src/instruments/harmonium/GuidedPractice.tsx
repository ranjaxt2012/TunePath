import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/src/constants/theme';

export function GuidedPractice() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>GuidedPractice</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  text: { fontSize: 14, color: Colors.textPrimary },
});
