import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, Spacing, FontSize, Radius } from '@/src/design';

export default function NotFoundScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={styles.emoji}>🎵</Text>
      <Text style={[styles.title, { color: theme.textPrimary }]}>Page not found</Text>
      <Text style={[styles.sub, { color: theme.textSecondary }]}>This page doesn't exist in TunePath.</Text>
      <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={() => router.replace('/(tabs)/discover' as any)}>
        <Text style={[styles.btnText, { color: theme.textOnPrimary }]}>Go to Discover</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xxl },
  emoji: { fontSize: 48 },
  title: { fontSize: FontSize.xl, fontWeight: '700' },
  sub: { fontSize: FontSize.sm, textAlign: 'center' },
  btn: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radius.lg, marginTop: Spacing.sm },
  btnText: { fontSize: FontSize.md, fontWeight: '700' },
});
