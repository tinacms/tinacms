// True when two values serialize to the same JSON. Adapters use it to keep a
// file's bytes when a save changes nothing.
export const isSameValue = (next: unknown, previous: unknown): boolean =>
  JSON.stringify(next) === JSON.stringify(previous);
