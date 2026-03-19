import { Colors } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { StyleSheet, Text, View } from 'react-native';

export function StaffNotation() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>StaffNotation</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  text: { fontSize: 14, color: '#FFFFFF' },
});
