import type { InstrumentPlugin } from './types';
import { HarmoniumPlugin } from '@/src/instruments/harmonium';
import { GuitarPlugin } from '@/src/instruments/guitar';
import { PianoPlugin } from '@/src/instruments/piano';

export const InstrumentRegistry: Record<string, InstrumentPlugin> = {
  harmonium: HarmoniumPlugin,
  guitar: GuitarPlugin,
  piano: PianoPlugin,
};

export function getPlugin(slug: string): InstrumentPlugin | null {
  return InstrumentRegistry[slug] ?? null;
}
