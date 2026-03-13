import type { InstrumentPlugin } from '@/src/registry/types';
import { GuitarPlayer } from './GuitarPlayer';

export const GuitarPlugin: InstrumentPlugin = {
  slug: 'guitar',
  displayName: 'Guitar',
  PlayerScreen: GuitarPlayer,
  parseNotation: (raw: unknown) => raw,
  supportsGuidedPractice: false,
  supportsBpm: false,
};
