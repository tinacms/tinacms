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
 * As a safety net, also rejects paths that still contain URL-encoded
 * traversal sequences (`%2e%2e`, `%2f`, `%5c`), catching cases where the
 * caller forgot to decode.
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
