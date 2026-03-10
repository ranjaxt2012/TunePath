/**
 * Phase-1 instrument options. Use slug for API/identity; title for display.
 */

import type { Instrument } from '../types/models';

export const INSTRUMENTS: Instrument[] = [
  { slug: 'harmonium', title: 'Harmonium' },
  { slug: 'guitar', title: 'Guitar' },
  { slug: 'piano', title: 'Piano' },
  { slug: 'vocals', title: 'Vocals' },
  { slug: 'tabla', title: 'Tabla' },
  { slug: 'violin', title: 'Violin' },
];
