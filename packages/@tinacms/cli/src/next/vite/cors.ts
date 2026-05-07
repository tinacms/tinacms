/**
 * Shared CORS origin-checking logic for the TinaCMS dev server.
 *
 * By default only localhost / 127.0.0.1 / [::1] (any port) are allowed.
 * Users can extend this via `server.allowedOrigins` in their tina config.
 * The special keyword `'private'` expands to all RFC 1918 private-network
 * IP ranges (10.x, 172.16-31.x, 192.168.x) — useful for WSL2, Docker
 * bridge networks, etc.
 */

const LOCALHOST_RE = /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

// RFC 1918 private networks: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
const PRIVATE_NETWORK_RE =
  /^https?:\/\/(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})(:\d+)?$/;

/**
 * Expand a raw `allowedOrigins` array: replace the `'private'` keyword
 * with the RFC 1918 regex and keep everything else as-is.
 */
function expandOrigins(raw: (string | RegExp)[]): (string | RegExp)[] {
  const hasPrivate = raw.some((o) => o === 'private');
  const filtered = raw.filter((o) => o !== 'private');
  return hasPrivate ? [...filtered, PRIVATE_NETWORK_RE] : filtered;
}

/**
 * Build a CORS `origin` callback compatible with the `cors` npm package.
 */
export function buildCorsOriginCheck(
  allowedOrigins: (string | RegExp)[] = []
): (
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void
) => void {
  const extra = expandOrigins(allowedOrigins);

  return (origin, callback) => {
    // Allow requests with no Origin header (curl, same-origin, etc.).
    if (!origin) {
      callback(null, true);
      return;
    }
    if (LOCALHOST_RE.test(origin)) {
      callback(null, true);
      return;
    }
    for (const allowed of extra) {
      if (typeof allowed === 'string') {
        if (allowed === origin) {
          callback(null, true);
          return;
        }
      } else {
        allowed.lastIndex = 0;
        if (allowed.test(origin)) {
          callback(null, true);
          return;
        }
      }
    }
    callback(null, false);
  };
}
