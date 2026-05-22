/**
 * Normalizes user-supplied strings into git-ref-safe branch segments.
 * Kept in its own file (no React or workspace-internal imports) so
 * non-React callers like `core/media-store.default.ts` can import it
 * without dragging in the rest of `plugin-branch-switcher` and creating
 * a cycle through `@toolkit/core`.
 */
export function formatBranchName(str: string): string {
  let result = '';
  let replacingInvalidChars = false;

  for (const char of str.toLowerCase()) {
    const code = char.charCodeAt(0);
    const isValid =
      char === '/' ||
      char === '-' ||
      char === '_' ||
      (code >= 48 && code <= 57) ||
      (code >= 97 && code <= 122);

    if (isValid) {
      result += char;
      replacingInvalidChars = false;
    } else if (!replacingInvalidChars) {
      result += '-';
      replacingInvalidChars = true;
    }
  }

  return result;
}
