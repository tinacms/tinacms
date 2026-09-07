/**
 * Resolve a router splat into a same-origin preview path.
 *
 * Do not filter the splat instead: the URL parser treats `\` as `/` and drops
 * leading tabs, so a character filter does not hold. Resolve the value first,
 * then reject any result that left this origin.
 *
 * `offOrigin` is true only when a splat was supplied and resolved elsewhere, so
 * callers can tell a rejected link from an empty one.
 */
export function resolvePreviewPath(
  splat: string | undefined,
  baseOrigin: string = typeof window !== 'undefined'
    ? window.location.origin
    : ''
): { path: string; offOrigin: boolean } {
  if (!baseOrigin || !splat) {
    return { path: '/', offOrigin: false };
  }
  try {
    const resolved = new URL(`/${splat}`, baseOrigin);
    if (resolved.origin !== baseOrigin) {
      return { path: '/', offOrigin: true };
    }
    return {
      path: `${resolved.pathname}${resolved.search}${resolved.hash}`,
      offOrigin: false,
    };
  } catch {
    return { path: '/', offOrigin: true };
  }
}
