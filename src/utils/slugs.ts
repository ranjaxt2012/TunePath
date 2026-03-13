// TODO: slug helpers for URL-safe instrument/level/course identifiers
export function toSlug(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
