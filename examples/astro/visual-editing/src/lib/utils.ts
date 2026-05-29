import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

/**
 * Shared card-link classes for listing pages.
 * Use with cn() to merge additional overrides per page.
 */
export const cardLinkClasses =
  'group block bg-gray-50 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-1000 rounded shadow-sm transition-all duration-150 ease-out hover:shadow-md hover:to-gray-50 dark:hover:to-gray-800';
