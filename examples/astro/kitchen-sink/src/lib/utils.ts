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

/**
 * Format a date string (ISO 8601 or JS Date string) into 'MMM DD, YYYY' format.
 * Returns empty string if date is invalid or not provided.
 */
export function formatDate(raw: string | undefined | null): string {
  if (!raw) return '';
  try {
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-AU', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}
