/**
 * Lightweight debug logger gated by a `?tina-debug=1` query param. No-op
 * by default so production-bundled bridges don't leak console noise.
 */
const ENABLED =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('tina-debug') === '1';

export function debug(...args: unknown[]): void {
  if (!ENABLED) return;
  console.log('[@tinacms/bridge]', ...args);
}
