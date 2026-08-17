/**
 * Centralised media object-key resolution / validation.
 *
 * Editors may only write to or delete object keys that resolve to a location
 * inside the operator-configured `mediaRoot`. This helper normalises a
 * caller-supplied key and guarantees the result stays within that boundary.
 *
 * It rejects empty keys, absolute paths, NUL bytes and path-traversal
 * attempts (including percent-encoded traversal). When `mediaRoot` is empty
 * (no boundary declared) the key is still normalised and the same illegal
 * inputs are still rejected, but the key is otherwise returned as-is.
 *
 * Callers should catch `MediaKeyError` and translate it into a 4xx response.
 *
 * NOTE: this file is intentionally duplicated byte-for-byte across the
 * first-party media adapters. The shared regression-test vectors guard
 * against the copies drifting apart.
 */
import path from 'node:path';

export class MediaKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MediaKeyError';
  }
}

// Trim leading and trailing slashes without a backtracking regex (avoids
// polynomial-time matching on attacker-controlled runs of slashes).
function stripSlashes(value: string): string {
  let start = 0;
  let end = value.length;
  while (start < end && value[start] === '/') start++;
  while (end > start && value[end - 1] === '/') end--;
  return value.slice(start, end);
}

function normalizeMediaRoot(mediaRoot: string): string {
  if (!mediaRoot) {
    return '';
  }
  return stripSlashes(mediaRoot);
}

/**
 * Resolve a caller-supplied media key against the configured mediaRoot.
 *
 * @throws {MediaKeyError} when the key is empty, absolute, contains a NUL
 * byte, uses path traversal, or escapes mediaRoot.
 */
export function resolveKey(
  mediaRoot: string,
  rawKey: unknown,
  options?: { decode?: boolean }
): string {
  if (typeof rawKey !== 'string' || rawKey.trim() === '') {
    throw new MediaKeyError('a media key is required');
  }

  // Inputs from a URL query / route segment are percent-encoded, so decode
  // them. Inputs from a multipart filename are literal and must NOT be decoded
  // (pass decode: false), otherwise a legitimate name like "100%.png" would be
  // rejected and "report%41.png" silently rewritten to "reportA.png".
  let decoded: string;
  if (options?.decode === false) {
    decoded = rawKey;
  } else {
    try {
      decoded = decodeURIComponent(rawKey);
    } catch {
      throw new MediaKeyError('media key is not valid');
    }
  }

  // Reject NUL bytes and backslash (Windows-style separator / traversal).
  if (decoded.includes('\0') || decoded.includes('\\')) {
    throw new MediaKeyError('media key is not valid');
  }

  // Reject absolute paths (POSIX root and Windows drive letters).
  if (decoded.startsWith('/') || /^[a-zA-Z]:/.test(decoded)) {
    throw new MediaKeyError('absolute media keys are not allowed');
  }

  // Normalise, then reject anything that climbs above the current root.
  const normalized = path.posix.normalize(decoded).replace(/^\.\//, '');
  if (normalized === '..' || normalized.startsWith('../')) {
    throw new MediaKeyError('media key may not traverse directories');
  }
  if (normalized === '' || normalized === '.') {
    throw new MediaKeyError('a media key is required');
  }

  const root = normalizeMediaRoot(mediaRoot);
  if (!root) {
    return normalized;
  }

  // The key may arrive already prefixed with mediaRoot (the delete path sends
  // the full object key) or relative to it (the upload path). Only prefix
  // when it is not already scoped.
  const scoped =
    normalized === root || normalized.startsWith(root + '/')
      ? normalized
      : path.posix.join(root, normalized);

  // Defence in depth: the resolved key must stay within mediaRoot.
  if (scoped !== root && !scoped.startsWith(root + '/')) {
    throw new MediaKeyError('media key escapes mediaRoot');
  }

  return scoped;
}

/**
 * Resolve a caller-supplied listing directory into a relative prefix.
 *
 * The directory is optional: an empty / root directory returns `''` (list the
 * mediaRoot itself). Otherwise leading/trailing slashes are stripped (matching
 * the historical handler behaviour) and the result is normalised so it cannot
 * traverse upward — `path.join(mediaRoot, directory)` would otherwise collapse
 * `..` and list objects outside mediaRoot. Returns a prefix with a trailing
 * slash so it can be joined onto mediaRoot directly.
 *
 * @throws {MediaKeyError} when the directory contains a NUL byte or backslash,
 * or uses upward path traversal.
 */
export function resolveDirectory(rawDirectory: unknown): string {
  // Listing directories arrive from a URL query and are decoded once by the
  // framework; treat them as literal (no further decode).
  if (typeof rawDirectory !== 'string' || rawDirectory.trim() === '') {
    return '';
  }

  if (rawDirectory.includes('\0') || rawDirectory.includes('\\')) {
    throw new MediaKeyError('media directory is not valid');
  }

  const trimmed = stripSlashes(rawDirectory);
  const normalized = path.posix.normalize(trimmed).replace(/^\.\//, '');
  if (normalized === '..' || normalized.startsWith('../')) {
    throw new MediaKeyError('media directory may not traverse directories');
  }
  if (normalized === '' || normalized === '.') {
    return '';
  }

  return normalized + '/';
}
