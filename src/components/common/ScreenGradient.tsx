import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/src/contexts/ThemeContext';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function ScreenGradient({ children, style }: Props) {
  const { theme } = useTheme();

  return (
    <LinearGradient
      colors={theme.gradient as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.gradient, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
