/**
 * Instrument Loader - loads harmonium instrument and sargam mapping
 * Local files only, no backend
 */

import type { InstrumentDefinition, SargamMap } from '../types/instrumentSound';

const instrumentDef: InstrumentDefinition = require('../../content/harmonium/base_sounds/instrument.json');
const sargamMapData: SargamMap = require('../../content/harmonium/base_sounds/sargamMap.json');

let _instrument: InstrumentDefinition | null = null;
let _sargamMap: Record<string, string> | null = null;

/**
 * Get the harmonium instrument definition (samples map)
 */
export function getInstrumentDefinition(): InstrumentDefinition {
  if (!_instrument) {
    _instrument = instrumentDef;
  }
  return _instrument;
}

/**
 * Get sargam syllable -> western note letter map
 * e.g. { Sa: "C", Re: "D", Ga: "E", ... }
 */
export function getSargamMap(): Record<string, string> {
  if (!_sargamMap) {
    _sargamMap = sargamMapData.sargamMap ?? {};
  }
  return _sargamMap;
}
