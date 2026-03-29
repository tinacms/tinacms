const LOCALHOST_ADDRESSES = ['localhost', '127.0.0.1', '::1'];

/**
 * Returns true when the Vite server host config indicates the server is
 * listening on a non-localhost address (i.e. exposed to the network).
 */
export function isHostExposed(host: string | boolean | undefined): boolean {
  if (host === true) return true;
  if (typeof host === 'string' && !LOCALHOST_ADDRESSES.includes(host))
    return true;
  return false;
}
