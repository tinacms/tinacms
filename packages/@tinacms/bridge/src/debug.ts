/**
 * Lightweight debug logger. Always-on while the bridge stabilises so the
 * postMessage handshake + island-refresh chain is visible from the iframe
 * console without flipping a flag. Gate behind a query param later once
 * the example reaches a steady state.
 */
const ENABLED = typeof window !== 'undefined';

export function debug(...args: unknown[]): void {
  if (!ENABLED) return;
  console.log('[@tinacms/bridge]', ...args);
}
