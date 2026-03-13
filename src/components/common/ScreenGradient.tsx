import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gradient } from '@/src/constants/theme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function ScreenGradient({ children, style }: Props) {
  return (
    <LinearGradient
      colors={[...Gradient.colors]}
      start={Gradient.start}
      end={Gradient.end}
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
