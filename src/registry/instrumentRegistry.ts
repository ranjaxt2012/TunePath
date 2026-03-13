import type { InstrumentPlugin } from './types';
import { HarmoniumPlugin } from '@/instruments/harmonium';
import { GuitarPlugin } from '@/instruments/guitar';
import { PianoPlugin } from '@/instruments/piano';

export const InstrumentRegistry: Record<string, InstrumentPlugin> = {
  harmonium: HarmoniumPlugin,
  guitar: GuitarPlugin,
  piano: PianoPlugin,
};

export function getPlugin(slug: string): InstrumentPlugin | null {
  return InstrumentRegistry[slug] ?? null;
}
