import type { InstrumentPlugin } from '@/src/registry/types';
import { HarmoniumPlayer } from './HarmoniumPlayer';

export const HarmoniumPlugin: InstrumentPlugin = {
  slug: 'harmonium',
  displayName: 'Harmonium',
  PlayerScreen: HarmoniumPlayer,
  parseNotation: (raw: unknown) => raw,
  supportsGuidedPractice: true,
  supportsBpm: true,
};
