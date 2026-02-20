/**
 * Path utilities — including security helpers for CWE-22 (Path Traversal).
 *
 * ## Why this file exists
 *
 * Several TinaCMS endpoints accept user-supplied paths (media list/upload/
 * delete, filesystem bridge operations). An attacker can craft a path like
 * `../../../etc/passwd` to read or write files outside the intended content
 * directory. The helpers in this file enforce that every resolved path stays
 * within a designated base directory.
 *
 * ## The core pattern
 *
 * ```
 *   const resolved = path.resolve(path.join(baseDir, userPath));
 *   if (!resolved.startsWith(resolvedBase + path.sep)) throw …
 * ```
 *
 * 1. `path.join` concatenates the user input onto the base.
 * 2. `path.resolve` collapses `..` segments.
 * 3. The `startsWith` check ensures the result hasn't escaped upward.
 * 4. Appending `path.sep` prevents prefix-matching attacks (e.g.
 *    `/uploads-evil` matching `/uploads`).
 *
 * ## Encoded-traversal safety net
 *
 * URL-encoded sequences like `%2e%2e` (`..`) or `%2f` (`/`) bypass the
 * `path.resolve` check because Node treats `%` as a literal character.
 * Callers are expected to decode before calling these helpers, but as a
 * defence-in-depth measure the regex `ENCODED_TRAVERSAL_RE` rejects any
 * input that still contains these sequences.
 *
 * ## CodeQL inlining caveat
 *
 * CodeQL's `js/path-injection` query tracks taint within a single call
 * boundary. When `assertPathWithinBase` is imported from this file into a
 * route handler, CodeQL sometimes can't follow the sanitisation across the
 * module boundary and still flags the call site. For this reason, the media
 * model files (`cli/src/server/models/media.ts` and
 * `cli/src/next/commands/dev-command/server/media.ts`) inline their own
 * copies (`resolveWithinBase` / `resolveStrictlyWithinBase`). **If you
 * change the validation logic here, you must update those copies too.**
 *
 * ## Choosing the right helper
 *
 * | Helper                      | Exact base match | Use case                          |
 * |-----------------------------|------------------|-----------------------------------|
 * | `assertPathWithinBase`      | allowed          | Listing / reading (base = root)   |
 * | `resolveWithinBase` (inline)| allowed          | Same, inlined for CodeQL          |
 * | `resolveStrictlyWithinBase` | rejected         | Delete / write (must target file) |
 *
 * @module
 */
import path from 'path';

/** Removes trailing slash from path. Separator to remove is chosen based on
 *  operating system. */
export function stripNativeTrailingSlash(p: string) {
  const { root } = path.parse(p);
  let str = p;

  // Remove only the OS-native separator
  while (str.length > root.length && str.endsWith(path.sep)) {
    str = str.slice(0, -1);
  }

  return str;
}

/**
 * Detects URL-encoded path-traversal sequences that should have been
 * decoded by the caller.  Acts as a safety net: if a caller forgets to
 * call `decodeURIComponent`, the still-encoded `%2e%2e%2f` would bypass
 * the `path.resolve + startsWith` check (Node treats the `%` literally).
 *
 * Matches (case-insensitive):
 *   %2e%2e → ..  (double-dot – directory traversal)
 *   %2f    → /   (forward slash)
 *   %5c    → \   (backslash – Windows separator)
 *
 * A single %2e (encoded dot) is NOT matched — it is harmless and may
 * appear in legitimate filenames or dotfile paths.
 */
const ENCODED_TRAVERSAL_RE = /%2e%2e|%2f|%5c/i;

/**
 * Validates that a user-supplied path does not escape the base directory
 * via path traversal (CWE-22). Returns the resolved absolute path.
 *
 * Allows an exact base match (empty or `.` input) — use this for list/read
 * operations where referencing the root directory itself is valid. For
 * delete/write operations where you need to target an actual file, use the
 * `resolveStrictlyWithinBase` variant (currently inlined in media models).
 *
 * As a safety net, also rejects paths that still contain URL-encoded
 * traversal sequences (`%2e%2e`, `%2f`, `%5c`), catching cases where the
 * caller forgot to decode.
 *
 * @security This is the canonical implementation. Inlined copies exist in
 * the media model files for CodeQL compatibility — keep them in sync.
 *
 * @param userPath - The untrusted path from the request (must already be
 *   URI-decoded by the caller).
 * @param baseDir  - The trusted base directory the path must stay within.
 * @returns The resolved absolute path.
 * @throws {PathTraversalError} If the path escapes the base directory.
 */
export function assertPathWithinBase(
  userPath: string,
  baseDir: string
): string {
  if (ENCODED_TRAVERSAL_RE.test(userPath)) {
    throw new PathTraversalError(userPath);
  }

  const resolvedBase = path.resolve(baseDir);
  const resolved = path.resolve(path.join(baseDir, userPath));

  // The resolved path must either equal the base exactly or be a child of it
  // (i.e. start with base + separator). This prevents both upward traversal
  // and prefix-matching attacks (e.g. /app/uploads-evil matching /app/uploads).
  if (
    resolved !== resolvedBase &&
    !resolved.startsWith(resolvedBase + path.sep)
  ) {
    throw new PathTraversalError(userPath);
  }

  return resolved;
}

export class PathTraversalError extends Error {
  constructor(attemptedPath: string) {
    super(
      `Path traversal detected: the path "${attemptedPath}" escapes the allowed directory`
    );
    this.name = 'PathTraversalError';
  }
}
