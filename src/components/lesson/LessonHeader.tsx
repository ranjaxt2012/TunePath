import { StyleSheet, Text, View } from 'react-native';

interface LessonHeaderProps {
  title: string;
}

export function LessonHeader({ title }: LessonHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#fff' },
});
