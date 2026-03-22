// Maps sargam note names to bundled audio assets
export type SargamNote = 'Sa' | 'Re' | 'Ga' | 'Ma' | 'Pa' | 'Dha' | 'Ni';

export type SampleMap = Record<string, any>;

export const HARMONIUM_SAMPLE_MAP: SampleMap = {
  Sa: require('../../../assets/instruments/harmonium/samples/Sa.mp3'),
  Re: require('../../../assets/instruments/harmonium/samples/Re.mp3'),
  Ga: require('../../../assets/instruments/harmonium/samples/Ga.mp3'),
  Ma: require('../../../assets/instruments/harmonium/samples/Ma.mp3'),
  Pa: require('../../../assets/instruments/harmonium/samples/Pa.mp3'),
  Dha: require('../../../assets/instruments/harmonium/samples/Dha.mp3'),
  Ni: require('../../../assets/instruments/harmonium/samples/Ni.mp3'),
};
