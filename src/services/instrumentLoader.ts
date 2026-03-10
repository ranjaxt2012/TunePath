/**
 * Instrument Loader - sargam mapping for harmonium.
 * No local files: uses inline map. Future: fetch from API.
 */

const SARGAM_MAP: Record<string, string> = {
  Sa: 'C',
  Re: 'D',
  Ga: 'E',
  Ma: 'F',
  Pa: 'G',
  Dha: 'A',
  Ni: 'B',
};

export function getSargamMap(): Record<string, string> {
  return SARGAM_MAP;
}
