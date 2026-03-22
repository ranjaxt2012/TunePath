import React, { useState } from 'react';
import { TouchableOpacity, Platform, ViewStyle } from 'react-native';

interface PressableProps {
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  hoverStyle?: ViewStyle;
  children: React.ReactNode;
  activeOpacity?: number;
}

export function Pressable({
  onPress,
  style,
  hoverStyle,
  children,
  activeOpacity = 0.7,
}: PressableProps) {
  const [hovered, setHovered] = useState(false);

  if (Platform.OS === 'web') {
    return (
      <div
        onClick={onPress as any}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          cursor: 'pointer',
          ...(style as any),
          ...(hovered ? hoverStyle : {}),
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} style={style} activeOpacity={activeOpacity}>
      {children}
    </TouchableOpacity>
  );
}
