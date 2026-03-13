import { StyleSheet, Text, View } from 'react-native';

export function SargamGrid() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>SargamGrid</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  text: { fontSize: 14, color: '#fff' },
});
