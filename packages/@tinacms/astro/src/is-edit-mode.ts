/**
 * Server-side check: is this request being rendered inside the TinaCMS
 * admin iframe?
 *
 * Two request shapes count as edit mode:
 *
 * **A. Iframe document navigation** (`Sec-Fetch-Dest: iframe`):
 *   1. `?tina-edit=1` — explicit signal added by the admin's router for
 *      deep-link previews.
 *   2. Same-origin Referer under `/admin/` — covers the first request
 *      after the admin sets `iframe.src` to a preview URL.
 *   3. A `__tina_edit=1` cookie — covers in-iframe `<a>` clicks where
 *      the Referer is the previous preview page rather than `/admin/`.
 *      The middleware sets the cookie on every edit-mode response so the
 *      session sticks for the iframe's lifetime.
 *
 * **B. Soft-navigation fetch** (`Sec-Fetch-Dest: empty` /
 * `Sec-Fetch-Site: same-origin` / cookie set): covers Astro's
 * `<ClientRouter />`, Turbo, htmx, etc. — anything that fetches the next
 * page from inside the iframe instead of letting the browser do a full
 * iframe navigation. Without this branch the middleware short-circuits
 * because `Sec-Fetch-Dest` is `empty`, the fetched HTML lacks the
 * `[data-tina-form]` divs and bridge script, and the bridge's
 * `refreshForms()` sees zero forms on the swapped DOM.
 *
 * Direct browser visits set `Sec-Fetch-Dest: document` for top-level
 * navigations, so a stale cookie left behind in someone's browser can
 * never trip edit mode outside an iframe — production HTML is byte-
 * identical to a Tina-free Astro app for end users.
 *
 * The `Sec-Fetch-Site: same-origin` requirement on branch B (combined
 * with `SameSite=Strict` on the cookie) means cross-site fetches can
 * never trip edit mode either, even from an attacker page on a
 * different origin that somehow obtained the cookie.
 */
export const EDIT_COOKIE = '__tina_edit';

/**
 * Set-Cookie header value the middleware writes on every edit-mode
 * response. Refreshing on each response keeps long editing sessions
 * sticky and short Max-Age limits the blast radius if a cookie lingers.
 * The `Sec-Fetch-Dest` and `Sec-Fetch-Site` gates in `isEditMode` block
 * the cookie from triggering edit mode on top-level visits or
 * cross-site requests.
 */
export const EDIT_COOKIE_HEADER = `${EDIT_COOKIE}=1; Path=/; SameSite=Strict; Max-Age=3600`;

export function isEditMode(request: Request): boolean {
  const url = new URL(request.url);
  if (url.searchParams.get('tina-edit') === '1') return true;

  const dest = request.headers.get('Sec-Fetch-Dest');
  const site = request.headers.get('Sec-Fetch-Site');
  const cookieSet = readCookie(request, EDIT_COOKIE) === '1';

  if (dest === 'iframe') {
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
        // Malformed Referer — fall through to cookie check.
      }
    }
    return cookieSet;
  }

  // Branch B: SPA-style fetch from inside the iframe (ClientRouter,
  // Turbo, htmx). The browser sets Sec-Fetch-Dest to `empty` for fetch()
  // and Sec-Fetch-Site to `same-origin`; the cookie is what links the
  // request back to the original iframe session.
  if (dest === 'empty' && site === 'same-origin' && cookieSet) {
    return true;
  }

  return false;
}

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('Cookie');
  if (!header) return null;
  for (const pair of header.split(';')) {
    const eq = pair.indexOf('=');
    if (eq === -1) continue;
    const key = pair.slice(0, eq).trim();
    if (key === name) return pair.slice(eq + 1).trim();
  }
  return null;
}
