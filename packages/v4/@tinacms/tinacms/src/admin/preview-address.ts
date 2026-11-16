/** The address a preview shows: host, path, search and hash, with no scheme. */
export const displayAddress = (href: string): string => {
  try {
    const url = new URL(href);
    return `${url.host}${url.pathname}${url.search}${url.hash}`;
  } catch {
    return href;
  }
};

export type ParsedAddress = { ok: true; url: URL } | { ok: false };

const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;
const AFTER_HOST = /^[/?#]|^$/;

/**
 * Reads the text an editor typed in the address box as an address on the preview's origin.
 * An address on another origin, or with a scheme other than http or https, is refused.
 */
export function parseAddress(
  typed: string,
  previewOrigin: string
): ParsedAddress | null {
  const text = typed.trim();
  if (text === '') return null;
  const origin = new URL(previewOrigin);

  let href: string;
  if (
    text.startsWith(origin.host) &&
    AFTER_HOST.test(text.slice(origin.host.length))
  ) {
    href = `${origin.protocol}//${text}`;
  } else if (/^https?:\/\//i.test(text)) {
    href = text;
  } else if (text.startsWith('/') && !text.startsWith('//')) {
    href = `${origin.origin}${text}`;
  } else if (text.startsWith('//') || HAS_SCHEME.test(text)) {
    return { ok: false };
  } else {
    href = `${origin.origin}/${text}`;
  }

  try {
    const url = new URL(href);
    const web = url.protocol === 'http:' || url.protocol === 'https:';
    return web && url.origin === origin.origin
      ? { ok: true, url }
      : { ok: false };
  } catch {
    return { ok: false };
  }
}

/** True when `next` differs from `current` only by a hash, and has one. */
export const isHashOnlyChange = (current: string, next: string): boolean => {
  try {
    const a = new URL(current);
    const b = new URL(next);
    if (b.hash === '' || a.hash === b.hash) return false;
    a.hash = '';
    b.hash = '';
    return a.href === b.href;
  } catch {
    return false;
  }
};
