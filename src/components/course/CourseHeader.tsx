import { StyleSheet, Text, View } from 'react-native';

interface CourseHeaderProps {
  title: string;
  description?: string;
}

export function CourseHeader({ title, description }: CourseHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  title: { fontSize: 22, fontWeight: '700', color: '#fff' },
  description: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 8 },
});
