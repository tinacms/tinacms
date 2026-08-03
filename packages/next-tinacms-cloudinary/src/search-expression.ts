/**
 * Escape a value for interpolation into a quoted Cloudinary Search API term.
 *
 * Cloudinary treats a double-quoted term literally except for `"` and `*`,
 * which keep their meaning and must be backslash-escaped. The backslash itself
 * is escaped first (in the same pass) so it cannot consume the escape added
 * for a following character.
 *
 * See https://cloudinary.com/documentation/search_expressions
 */
export function escapeSearchValue(value: string): string {
  return value.replace(/[\\"*]/g, '\\$&');
}
