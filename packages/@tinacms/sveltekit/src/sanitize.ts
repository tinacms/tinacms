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

export function sanitizeImageSrc(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
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
