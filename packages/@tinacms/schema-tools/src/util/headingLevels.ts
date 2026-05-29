import { ALL_HEADING_LEVELS, type HeadingLevel } from '../types/index';

/**
 * Cast-free type guard for HeadingLevel. The exhaustive switch lets TS
 * narrow `string` → `HeadingLevel` without an `as` cast, so it doubles
 * as a runtime validator for untrusted (pure-JS) schema input.
 */
export const isHeadingLevel = (value: string): value is HeadingLevel => {
  switch (value) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return true;
    default:
      return false;
  }
};

/**
 * Filters out values that aren't real HeadingLevels (a JS schema can
 * declare anything at runtime), dedupes, and preserves the order the
 * user wrote. Returns an empty array when no valid levels remain — an
 * explicit `[]` therefore means "no headings", not "fall back to all".
 */
export const normalizeHeadingLevels = (
  configured: readonly string[]
): readonly HeadingLevel[] => {
  const seen = new Set<HeadingLevel>();
  for (const level of configured) {
    if (isHeadingLevel(level)) seen.add(level);
  }
  return Array.from(seen);
};
