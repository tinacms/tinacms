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
 * Validates that a user-supplied path does not escape the base directory
 * via path traversal (CWE-22). Returns the resolved absolute path.
 */
export function assertPathWithinBase(
  userPath: string,
  baseDir: string
): string {
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
