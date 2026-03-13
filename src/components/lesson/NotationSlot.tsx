/**
 * NotationSlot — filled by instrument plugin at runtime.
 */

import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface NotationSlotProps {
  children?: ReactNode;
}

export function NotationSlot({ children }: NotationSlotProps) {
  return (
    <View style={styles.container}>
      {children ?? <Text style={styles.placeholder}>Notation</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { minHeight: 80, padding: 16 },
  placeholder: { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
});
