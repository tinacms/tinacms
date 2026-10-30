import { resolve } from '$app/paths';

/** Prefixes root-relative paths with the deployment base path (e.g. GitHub Pages `/<repo>`). */
export function withBase(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  return (resolve as (pathname: string) => string)(path);
}

/**
 * True for links to files such as `/admin/index.html`. These are not app routes, so
 * they need a full page load instead of SvelteKit's client-side navigation.
 */
export function isFileLink(href: string): boolean {
  const path = href.split(/[?#]/)[0];
  return /\.[a-z0-9]+$/i.test(path.slice(path.lastIndexOf('/') + 1));
}

export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs.filter(Boolean).join(' ');
}

/**
 * Sanitizes a CMS-supplied href, returning a safe URL or the fallback.
 * Blocks dangerous schemes (javascript:, data:, vbscript:) and protocol-relative URLs.
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
    return trimmed.startsWith('/') ? withBase(trimmed) : trimmed;
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
 * Validates a CMS-supplied image src, returning the src string if safe or empty string.
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
    return withBase(trimmed);
  }
  try {
    const url = new URL(trimmed);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return trimmed;
    }
  } catch {
    return '';
  }
  return '';
}

/**
 * Formats an ISO date string to a localized human-readable date.
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}
