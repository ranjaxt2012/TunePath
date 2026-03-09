import { INSTRUMENT_NOTATIONS, InstrumentNotation } from '../types/instrumentTypes';

/**
 * Retrieves instrument notation data for a given instrument
 * @param instrument - The name of the instrument
 * @returns InstrumentNotation object or null if not found
 */
export const getInstrumentNotation = (instrument: string): InstrumentNotation | null => {
  const normalizedInstrument = instrument.toLowerCase().trim();
  
  const instrumentData = INSTRUMENT_NOTATIONS.find(
    (item) => item.instrument.toLowerCase() === normalizedInstrument
  );
  
  return instrumentData || null;
};

/**
 * Gets all available instruments
 * @returns Array of instrument names
 */
export const getAllInstruments = (): string[] => {
  return INSTRUMENT_NOTATIONS.map(item => item.instrument);
};

/**
 * Gets instruments by family
 * @param family - The instrument family to filter by
 * @returns Array of instruments in the specified family
 */
export const getInstrumentsByFamily = (family: string): InstrumentNotation[] => {
  return INSTRUMENT_NOTATIONS.filter(
    item => item.family.toLowerCase() === family.toLowerCase()
  );
};

/**
 * Checks if an instrument exists in our data
 * @param instrument - The instrument name to check
 * @returns boolean indicating if instrument exists
 */
export const isValidInstrument = (instrument: string): boolean => {
  return getInstrumentNotation(instrument) !== null;
};
