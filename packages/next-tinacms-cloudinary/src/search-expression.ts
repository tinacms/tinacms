/**
 * Escape a value for interpolation into a quoted Cloudinary Search API term.
 *
 * Cloudinary treats a double-quoted term literally except for `"` and `*`,
 * which keep their meaning and must be backslash-escaped. Backslash is escaped
 * too as a conservative hedge; callers reach this through resolveDirectory,
 * which already rejects backslashes, so that branch is unreachable today.
 *
 * See https://cloudinary.com/documentation/search_expressions
 */
export function escapeSearchValue(value: string): string {
  return value.replace(/[\\"*]/g, '\\$&');
}
