/**
 * Sanitizes a CMS-supplied href, returning a safe URL or the fallback.
 * Blocks dangerous schemes (javascript:, data:, vbscript:) and
 * protocol-relative URLs (//evil.com). Allows relative paths, http(s),
 * and mailto:.
 */
export function sanitizeHref(value: unknown, fallback = '#'): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:')
  ) {
    return fallback;
  }
  if (
    (trimmed.startsWith('/') && !trimmed.startsWith('//')) ||
    trimmed.startsWith('./') ||
    trimmed.startsWith('../') ||
    trimmed.startsWith('#')
  ) {
    return trimmed;
  }
  try {
    const url = new URL(trimmed);
    if (
      url.protocol === 'http:' ||
      url.protocol === 'https:' ||
      url.protocol === 'mailto:'
    ) {
      return trimmed;
    }
  } catch {
    return fallback;
  }
  return fallback;
}

/**
 * Validates a CMS-supplied image src, returning the src string if safe or ''
 * if it is empty, not a string, or uses a non-http(s)/relative scheme.
 */
export function sanitizeImageSrc(src: unknown): string {
  if (typeof src !== 'string') return '';
  const trimmed = src.trim();
  if (!trimmed) return '';
  if (
    trimmed.startsWith('./') ||
    trimmed.startsWith('../') ||
    (trimmed.startsWith('/') && !trimmed.startsWith('//'))
  ) {
    return trimmed;
  }
  try {
    const url = new URL(trimmed);
    if (url.protocol === 'http:' || url.protocol === 'https:') return trimmed;
  } catch {
    return '';
  }
  return '';
}

// Mirrors `isSafeCssColor` in @tinacms/mdx (src/sanitize-css-color.ts); this
// package keeps a copy so it doesn't depend on @tinacms/mdx.
const COLOR_FUNCTIONS = new Set([
  'rgb',
  'rgba',
  'hsl',
  'hsla',
  'hwb',
  'lab',
  'lch',
  'oklab',
  'oklch',
  'color',
  'color-mix',
  'light-dark',
  'calc',
  'var',
]);

const isSafeColorFunction = (value: string) => {
  if (!/^[a-z-]+\([a-z0-9_.,%/#() +-]*\)$/i.test(value)) {
    return false;
  }
  let depth = 0;
  for (const [token, name = ''] of value.matchAll(/([a-z-]*)\(|\)/gi)) {
    if (token === ')') {
      depth--;
    } else if (COLOR_FUNCTIONS.has(name.toLowerCase())) {
      depth++;
    } else {
      return false;
    }
    if (depth < 0) {
      return false;
    }
  }
  return depth === 0;
};

const isSafeCssColor = (value: string) => {
  const trimmed = value.trim();
  const color = trimmed.toLowerCase().endsWith('!important')
    ? trimmed.slice(0, -'!important'.length).trimEnd()
    : trimmed;
  return (
    /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color) ||
    /^[a-z]+$/i.test(color) ||
    isSafeColorFunction(color)
  );
};

/**
 * Returns a CMS-supplied colour when it's a plain CSS colour (hex, named, or
 * colour functions like rgb()/lab()/color-mix()/var()), else `undefined`, so
 * a colour can't smuggle extra declarations into a `style` attribute.
 */
export function sanitizeCssColor(value: unknown): string | undefined {
  return typeof value === 'string' && isSafeCssColor(value) ? value : undefined;
}
