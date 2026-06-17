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

function normalizeMediaRoot(mediaRoot: string): string {
  if (!mediaRoot) {
    return '';
  }
  return mediaRoot.replace(/^\/+/, '').replace(/\/+$/, '');
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
