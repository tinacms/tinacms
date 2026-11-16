export const EDIT_COOKIE = '__tina_edit';
export const EDIT_COOKIE_HEADER = `${EDIT_COOKIE}=1; Path=/; SameSite=Strict; Max-Age=3600`;

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
