export interface InstrumentNotation {
  instrument: string;
  family: string;
  primary_notation: string;
  details: string;
}

export const INSTRUMENT_NOTATIONS: InstrumentNotation[] = [
  {
    "instrument": "Piano",
    "family": "Keyboard",
    "primary_notation": "Staff",
    "details": "Uses Grand Staff (Treble and Bass clef simultaneously)."
  },
  {
    "instrument": "Guitar",
    "family": "Fretted Strings",
    "primary_notation": "Tablature (Tabs)",
    "details": "Indicates fret numbers and string positions."
  },
  {
    "instrument": "Sitar",
    "family": "Indian Classical",
    "primary_notation": "Sargam",
    "details": "Uses syllables (Sa, Re, Ga) based on a relative tonic."
  },
  {
    "instrument": "Violin",
    "family": "Bowed Strings",
    "primary_notation": "Staff",
    "details": "Primarily written in Treble clef."
  },
  {
    "instrument": "Erhu",
    "family": "Traditional Chinese",
    "primary_notation": "Jianpu",
    "details": "A numbered system (1-7) representing scale degrees."
  },
  {
    "instrument": "Drum Kit",
    "family": "Percussion",
    "primary_notation": "Percussion Staff",
    "details": "Standard lines/spaces represent specific drum components."
  },
  {
    "instrument": "Harmonium",
    "family": "Keyboard",
    "primary_notation": "Sargam",
    "details": "Similar to piano but with reed-based sound production."
  },
  {
    "instrument": "Tabla",
    "family": "Indian Percussion",
    "primary_notation": "Bols",
    "details": "Uses onomatopoeic syllables (Dha, Tin, Na) to represent strokes."
  },
  {
    "instrument": "Vocals",
    "family": "Voice",
    "primary_notation": "Staff with Lyrics",
    "details": "Combines musical notation with text for singing."
  }
];

export type InstrumentName = 
  | "Piano" 
  | "Guitar" 
  | "Sitar" 
  | "Violin" 
  | "Erhu" 
  | "Drum Kit"
  | "Harmonium"
  | "Tabla"
  | "Vocals";
