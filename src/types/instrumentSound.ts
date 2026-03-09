/**
 * Types for harmonium instrument and sargam sound mapping
 */

export interface InstrumentDefinition {
  instrument: string;
  notationSystem: string;
  samples: Record<string, string>;
}

export interface SargamMap {
  sargamMap: Record<string, string>;
}
