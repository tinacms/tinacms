/**
 * Top-level browser visits send `Sec-Fetch-Dest: document`, so a stale
 * cookie can never trip edit mode outside an iframe context. The cookie
 * is `SameSite=Strict`, so cross-site fetches don't carry it either.
 */
export const EDIT_COOKIE = '__tina_edit';
export const EDIT_COOKIE_HEADER = `${EDIT_COOKIE}=1; Path=/; SameSite=Strict; Max-Age=3600`;

export function isEditMode(request: Request): boolean {
  const dest = request.headers.get('Sec-Fetch-Dest');
  const site = request.headers.get('Sec-Fetch-Site');
  const cookieSet = readCookie(request, EDIT_COOKIE) === '1';

  if (dest === 'iframe') {
    return hasAdminReferer(request) || cookieSet;
  }
  if (dest === 'empty' && site === 'same-origin' && cookieSet) return true;

  // Explicit deep-link override — the admin's router appends `?tina-edit=1`
  // when it sets `iframe.src` on a preview deep-link. Checked last so the
  // URL parse cost is only paid when the cheaper header checks failed.
  if (request.url.includes('tina-edit=1')) {
    return new URL(request.url).searchParams.get('tina-edit') === '1';
  }
  return false;
}

function hasAdminReferer(request: Request): boolean {
  const referer = request.headers.get('Referer');
  if (!referer) return false;
  try {
    const ref = new URL(referer);
    const requestOrigin = new URL(request.url).origin;
    return ref.origin === requestOrigin && ref.pathname.startsWith('/admin/');
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
