import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const HOLI_STEPS: [string, string, string][] = [
  ['#FF006E', '#FB5607', '#FFBE0B'],
  ['#FB5607', '#FFBE0B', '#06D6A0'],
  ['#FFBE0B', '#06D6A0', '#3A86FF'],
  ['#06D6A0', '#3A86FF', '#8338EC'],
  ['#3A86FF', '#8338EC', '#FF006E'],
  ['#8338EC', '#FF006E', '#FB5607'],
];

interface HoliGradientProps {
  style?: object;
  children?: React.ReactNode;
}

export function HoliGradient({
  style,
  children,
}: HoliGradientProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(prev => (prev + 1) % HOLI_STEPS.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <LinearGradient
      colors={HOLI_STEPS[step]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[StyleSheet.absoluteFill, style]}
    >
      {children}
    </LinearGradient>
  );
}
