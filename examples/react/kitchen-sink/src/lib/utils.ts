import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates a CMS-supplied image src, returning the src string if safe or ''
 * if it is empty, not a string, or uses a non-http(s)/relative scheme.
 * Pass the result directly to <Image src={...}> – an empty string causes the
 * image to be omitted by the surrounding conditional guard.
 */
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
 * Pass the result directly to <Image src={...}> – an empty string causes the
 * image to be omitted by the surrounding conditional guard.
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
 * Format a date string (ISO 8601 or JS Date string) into 'MMM DD, YYYY' format
 * Returns empty string if date is invalid or not provided
 */
export function formatDate(raw: string | undefined | null): string {
  if (!raw) return '';
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-AU', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

/**
 * Shared card-link classes for listing pages
 * Use with cn() to merge additional overrides per page
 */
export const cardLinkClasses =
  'group block bg-gray-50 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-1000 rounded shadow-sm transition-all duration-150 ease-out hover:shadow-md hover:to-gray-50 dark:hover:to-gray-800';
