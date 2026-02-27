import React from 'react';
import { View, ViewProps } from 'react-native';
import { useColorScheme } from 'react-native';

import { Colors, BorderRadius, Spacing } from '@/constants/theme';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Card({
  variant = 'default',
  padding = 'md',
  children,
  style,
  ...props
}: CardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'unspecified' ? 'light' : colorScheme];

  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.backgroundElement,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        };
      case 'outlined':
        return {
          backgroundColor: colors.backgroundElement,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'default':
      default:
        return {
          backgroundColor: colors.backgroundElement,
        };
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return { padding: 0 };
      case 'sm':
        return { padding: Spacing.sm };
      case 'md':
        return { padding: Spacing.md };
      case 'lg':
        return { padding: Spacing.lg };
      default:
        return { padding: Spacing.md };
    }
  };

  return (
    <View
      style={[
        {
          borderRadius: BorderRadius.lg,
          ...getVariantStyles(),
          ...getPaddingStyles(),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
