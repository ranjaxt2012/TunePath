/**
 * Notation utilities — flat note array manipulation.
 * chunkNotes groups notes into fixed-size lines for karaoke display.
 */

export type Note = {
  note: string;
  time: number;
  lyric?: string;  // sung word (e.g. Devanagari) for karaoke
};

/**
 * Groups a flat notes array into lines of exactly `size` notes each.
 * Last line may have fewer than size notes.
 *
 * @example
 * chunkNotes([Sa,Re,Ga,Ma,Pa,Dha,Ni,Sa,Re,Ga,Ga,Ma], 4)
 * → [[Sa,Re,Ga,Ma], [Pa,Dha,Ni,Sa], [Re,Ga,Ga,Ma]]
 */
export function chunkNotes(notes: Note[], size = 4): Note[][] {
  if (notes.length === 0) return [];
  const result: Note[][] = [];
  for (let i = 0; i < notes.length; i += size) {
    result.push(notes.slice(i, i + size));
  }
  return result;
}
