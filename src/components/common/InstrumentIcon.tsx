import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { INSTRUMENT_ICONS, DEFAULT_INSTRUMENT_ICON } from '@/src/constants/instrumentIcons';
import { Colors } from '@/src/constants/theme';

type Props = {
  slug: string;
  size?: number;
  color?: string;
};

/** Renders instrument icon from slug. Minimum 20px for inline use. */
export function InstrumentIcon({ slug, size = 24, color = Colors.textPrimary }: Props) {
  const config = INSTRUMENT_ICONS[slug] ?? DEFAULT_INSTRUMENT_ICON;
  const c = color ?? Colors.textPrimary;
  if (config.lib === 'Ionicons') {
    return <Ionicons name={config.name} size={size} color={c} />;
  }
  return <MaterialCommunityIcons name={config.name} size={size} color={c} />;
}
