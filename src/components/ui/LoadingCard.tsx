import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { useTheme, Radius, Spacing } from '@/src/design';

export function LoadingCard({ width = 140 }: { width?: number }) {
  const { theme } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View style={[styles.card, { width, backgroundColor: theme.surface, opacity }]}>
      <View style={[styles.thumb, { backgroundColor: theme.surfaceHigh }]} />
      <View style={styles.info}>
        <View style={[styles.line, { backgroundColor: theme.surfaceHigh, width: '80%' }]} />
        <View style={[styles.line, { backgroundColor: theme.surfaceHigh, width: '55%' }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.lg, overflow: 'hidden' },
  thumb: { width: '100%', height: 90 },
  info: { padding: Spacing.sm, gap: Spacing.xs },
  line: { height: 10, borderRadius: Radius.sm },
});
