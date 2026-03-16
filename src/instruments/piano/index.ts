import type { InstrumentPlugin } from '@/src/registry/types';
import { PianoPlayer } from './PianoPlayer';

export const PianoPlugin: InstrumentPlugin = {
  slug: 'piano',
  displayName: 'Piano',
  PlayerScreen: PianoPlayer,
  parseNotation: (raw: unknown) => raw,
  supportsGuidedPractice: false,
  supportsBpm: false,
};
