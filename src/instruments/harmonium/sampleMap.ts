/**
 * Sargam note name → Metro bundler asset (require) for harmonium samples.
 * Shared by HarmoniumPlayer, SargamPlayerEngine, and useHarmoniumSound.
 */

export const HARMONIUM_SAMPLE_MAP: Record<string, number> = {
  Sa: require('../../../assets/instruments/harmonium/samples/Sa.mp3') as number,
  Re: require('../../../assets/instruments/harmonium/samples/Re.mp3') as number,
  Ga: require('../../../assets/instruments/harmonium/samples/Ga.mp3') as number,
  Ma: require('../../../assets/instruments/harmonium/samples/Ma.mp3') as number,
  Pa: require('../../../assets/instruments/harmonium/samples/Pa.mp3') as number,
  Dha: require('../../../assets/instruments/harmonium/samples/Dha.mp3') as number,
  Ni: require('../../../assets/instruments/harmonium/samples/Ni.mp3') as number,
};
