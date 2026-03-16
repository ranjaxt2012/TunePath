import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];
type MaterialCommunityIconsName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type InstrumentIconConfig =
  | { lib: 'Ionicons'; name: IoniconsName }
  | { lib: 'MaterialCommunityIcons'; name: MaterialCommunityIconsName };

export const INSTRUMENT_ICONS: Record<string, InstrumentIconConfig> = {
  harmonium: { lib: 'MaterialCommunityIcons', name: 'music-clef-treble' },
  guitar: { lib: 'MaterialCommunityIcons', name: 'guitar-electric' },
  piano: { lib: 'MaterialCommunityIcons', name: 'piano' },
  tabla: { lib: 'MaterialCommunityIcons', name: 'music' },
  violin: { lib: 'MaterialCommunityIcons', name: 'violin' },
  vocals: { lib: 'Ionicons', name: 'mic' },
};

export const DEFAULT_INSTRUMENT_ICON: InstrumentIconConfig = {
  lib: 'Ionicons',
  name: 'musical-notes',
};
