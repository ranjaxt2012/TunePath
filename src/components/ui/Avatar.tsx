import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme, FontSize } from '@/src/design';

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: number;
}

export function Avatar({ name, imageUrl, size = 40 }: AvatarProps) {
  const { theme } = useTheme();
  const initials = name.slice(0, 2).toUpperCase();
  const radius = size / 2;
  const fontSize = size * 0.36;

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={{ width: size, height: size, borderRadius: radius }}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: radius, backgroundColor: theme.primary },
      ]}
    >
      <Text style={[styles.initials, { color: theme.textOnPrimary, fontSize }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  initials: { fontWeight: '700' },
});
