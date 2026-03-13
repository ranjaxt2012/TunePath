import { StyleSheet, Text, View } from 'react-native';

interface YouTubeLinkProps {
  url: string;
  label?: string;
}

export function YouTubeLink({ url, label = 'Watch on YouTube' }: YouTubeLinkProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 8 },
  text: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
});
