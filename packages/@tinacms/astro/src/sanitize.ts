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
const SAFE_CSS_COLOR_PATTERNS = [
  /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i,
  /^[a-z]+$/i,
  /^(?:rgba?|hsla?|oklch|oklab)\([0-9.,%/ a-z-]*\)$/i,
  /^var\(--[a-z0-9_-]+\)$/i,
];

/**
 * Returns a CMS-supplied colour when it's a plain CSS colour (hex, named,
 * rgb()/hsl()/oklch()/oklab() or var(--name)), else `undefined`, so a
 * colour can't smuggle extra declarations into a `style` attribute.
 */
export function sanitizeCssColor(value: unknown): string | undefined {
  return typeof value === 'string' &&
    SAFE_CSS_COLOR_PATTERNS.some((pattern) => pattern.test(value))
    ? value
    : undefined;
}
