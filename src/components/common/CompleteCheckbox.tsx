import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from 'react-native';
import { TextPresets, Typography } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

const SIZE = 28;
const CHECKMARK = '\u2713'; // ✓

type CompleteCheckboxProps = {
  isComplete: boolean;
  onToggle: () => void;
  loading?: boolean;
  /** When true, hide "Done" label — for compact placement (e.g. title row) */
  compact?: boolean;
};

export function CompleteCheckbox({
  isComplete,
  onToggle,
  loading = false,
  compact = false,
}: CompleteCheckboxProps) {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isComplete) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          useNativeDriver: true,
          speed: 50,
          bounciness: 4,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 50,
          bounciness: 8,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [isComplete, scaleAnim]);

  return (
    <TouchableOpacity
      style={styles.wrapper}
      onPress={onToggle}
      disabled={loading}
      activeOpacity={0.8}
    >
      {!isComplete && !compact && (
        <Text style={styles.label}>Done</Text>
      )}
      <View style={styles.squareWrap}>
        {loading ? (
          <ActivityIndicator size="small" color={theme.textPrimary} />
        ) : (
          <Animated.View
            style={[
              styles.square,
              { backgroundColor: isComplete ? theme.success : theme.bgPrimary },
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Text style={[styles.checkmark, { color: '#FFFFFF' }]}>{CHECKMARK}</Text>
          </Animated.View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    ...TextPresets.caption,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  squareWrap: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  square: {
    width: SIZE,
    height: SIZE,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squareDefault: {
  },
  squareComplete: {
  },
  checkmark: {
    fontSize: 16,
    fontFamily: Typography.bold,
  },
});
