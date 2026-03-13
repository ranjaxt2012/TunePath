import { getPlugin } from '@/src/registry/instrumentRegistry';
import type { InstrumentPlugin } from '@/src/registry/types';

export function useInstrumentPlugin(slug: string): InstrumentPlugin | null {
  return getPlugin(slug);
}
