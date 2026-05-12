/**
 * Server-side check: is this request being rendered for the TinaCMS
 * admin iframe?
 *
 * Trips on three shapes:
 *   1. `?tina-edit=1` — explicit deep-link signal from the admin.
 *   2. Iframe nav (`Sec-Fetch-Dest: iframe`) with either a same-origin
 *      Referer under `/admin/` (initial preview load) or the
 *      `__tina_edit=1` cookie (in-iframe `<a>` clicks).
 *   3. SPA fetch from inside the iframe (`Sec-Fetch-Dest: empty`,
 *      `Sec-Fetch-Site: same-origin`, cookie set) — covers Astro
 *      `<ClientRouter />`, Turbo, htmx, etc.
 *
 * Top-level browser visits send `Sec-Fetch-Dest: document`, so a stale
 * cookie can never trip edit mode outside an iframe context. The cookie
 * is `SameSite=Strict`, so cross-site fetches don't carry it either.
 */
export const EDIT_COOKIE = '__tina_edit';

/** Refreshed on every edit-mode response so the session sticks. */
export const EDIT_COOKIE_HEADER = `${EDIT_COOKIE}=1; Path=/; SameSite=Strict; Max-Age=3600`;

export function isEditMode(request: Request): boolean {
  const url = new URL(request.url);
  if (url.searchParams.get('tina-edit') === '1') return true;

  const dest = request.headers.get('Sec-Fetch-Dest');
  const site = request.headers.get('Sec-Fetch-Site');
  const cookieSet = readCookie(request, EDIT_COOKIE) === '1';

  if (dest === 'iframe') {
    return hasAdminReferer(request, url) || cookieSet;
  }
  return dest === 'empty' && site === 'same-origin' && cookieSet;
}

function hasAdminReferer(request: Request, url: URL): boolean {
  const referer = request.headers.get('Referer');
  if (!referer) return false;
  try {
    const ref = new URL(referer);
    return ref.origin === url.origin && ref.pathname.startsWith('/admin/');
  } catch {
    return false;
  }
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
