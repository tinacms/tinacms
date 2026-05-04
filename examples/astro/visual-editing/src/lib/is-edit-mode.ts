/**
 * Server-side check: is this request being rendered inside the TinaCMS
 * admin iframe?
 *
 * Loads the bridge in any of:
 *   1. ?tina-edit=1 — explicit signal (added by the page collection's
 *      ui.router so deep links to a doc work).
 *   2. Sec-Fetch-Dest: iframe sent by the browser, AND a same-origin
 *      Referer that lives under /admin/ — covers the case where the
 *      user navigates the admin's preview iframe freely and never goes
 *      through a router-resolved URL.
 *
 * Direct browser visits send no Referer of that shape and Sec-Fetch-Dest
 * is "document", so production traffic never trips this and ships zero JS.
 */
export function isEditMode(request: Request): boolean {
  const url = new URL(request.url);
  if (url.searchParams.get('tina-edit') === '1') return true;

  const dest = request.headers.get('Sec-Fetch-Dest');
  if (dest !== 'iframe') return false;

  const referer = request.headers.get('Referer');
  if (!referer) return false;

  try {
    const refererUrl = new URL(referer);
    if (refererUrl.origin !== url.origin) return false;
    return refererUrl.pathname.startsWith('/admin/');
  } catch {
    return false;
  }
}
