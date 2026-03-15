import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from 'react-native';
import { Colors, TextPresets, Typography } from '@/src/constants/theme';

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
      <View style={styles.circleWrap}>
        {loading ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <Animated.View
            style={[
              styles.circle,
              isComplete ? styles.circleFilled : styles.circleOutline,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            {isComplete && <Text style={styles.checkmark}>{CHECKMARK}</Text>}
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
  circleWrap: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleOutline: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  circleFilled: {
    backgroundColor: Colors.bgPrimary,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Typography.bold,
  },
});
