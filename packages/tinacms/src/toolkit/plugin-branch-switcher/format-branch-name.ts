/**
 * Normalizes user-supplied strings into git-ref-safe branch segments.
 * Kept in its own file (no React or workspace-internal imports) so
 * non-React callers like `core/media-store.default.ts` can import it
 * without dragging in the rest of `plugin-branch-switcher` and creating
 * a cycle through `@toolkit/core`.
 */
export function formatBranchName(str: string): string {
  return str.replace(/[^/\w-]+/g, '-').toLowerCase();
}
