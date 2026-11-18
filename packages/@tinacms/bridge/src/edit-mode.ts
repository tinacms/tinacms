export const EDIT_COOKIE = '__tina_edit';

/**
 * Set-Cookie header value adapters write on every edit-mode response.
 * Refreshing on each response keeps long editing sessions sticky and a
 * short Max-Age limits the blast radius if a cookie lingers.
 */
export const EDIT_COOKIE_HEADER = `${EDIT_COOKIE}=1; Path=/; SameSite=Strict; Max-Age=3600`;

/**
 * Server-side check: is this request being rendered inside the TinaCMS
 * admin iframe?
 *
 * Resolves true when any of the following hold:
 *   1. `?tina-edit=1` — explicit signal added by the admin's router for
 *      deep-link previews.
 *   2. `Sec-Fetch-Dest: iframe` AND a same-origin Referer under
 *      `/admin/` — covers the first request after the admin sets
 *      `iframe.src` to a preview URL.
 *   3. `Sec-Fetch-Dest: iframe` AND a `__tina_edit=1` cookie — covers
 *      in-iframe link clicks, where the Referer is the previous preview
 *      page rather than `/admin/`. Adapters set the cookie on every
 *      edit-mode response so the session sticks for the iframe's lifetime.
 *
 * Direct browser visits set `Sec-Fetch-Dest: document` for top-level
 * navigations, so a stale cookie can never trip edit mode outside an iframe.
 */
export function isEditMode(request: Request): boolean {
  const url = new URL(request.url);
  if (url.searchParams.get('tina-edit') === '1') return true;

  if (request.headers.get('Sec-Fetch-Dest') !== 'iframe') return false;

  const referer = request.headers.get('Referer');
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (
        refererUrl.origin === url.origin &&
        refererUrl.pathname.startsWith('/admin/')
      ) {
        return true;
      }
    } catch {
      // A malformed Referer is treated as absent.
    }
  }

  return readCookie(request, EDIT_COOKIE) === '1';
}

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('Cookie');
  if (!header) return null;
  for (const pair of header.split(';')) {
    const eq = pair.indexOf('=');
    if (eq === -1) continue;
    if (pair.slice(0, eq).trim() === name) return pair.slice(eq + 1).trim();
  }
  return null;
}
