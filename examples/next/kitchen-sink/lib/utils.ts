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
export function sanitizeImageSrc(src: unknown): string {
  if (typeof src !== 'string') return '';
  const trimmed = src.trim();
  if (!trimmed) return '';
  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('./') ||
    trimmed.startsWith('../')
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
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

/**
 * Color gradient classes for title/heading text
 * Maps color theme names to Tailwind gradient classes
 */
export const titleColorClasses: Record<string, string> = {
  blue: 'from-blue-400 to-blue-600 dark:from-blue-300 dark:to-blue-500',
  teal: 'from-teal-400 to-teal-600 dark:from-teal-300 dark:to-teal-500',
  green: 'from-green-400 to-green-600 dark:from-green-300 dark:to-green-500',
  red: 'from-red-400 to-red-600 dark:from-red-300 dark:to-red-500',
  pink: 'from-pink-300 to-pink-500 dark:from-pink-300 dark:to-pink-500',
  purple:
    'from-purple-400 to-purple-600 dark:from-purple-300 dark:to-purple-500',
  orange:
    'from-orange-300 to-orange-600 dark:from-orange-200 dark:to-orange-500',
  yellow:
    'from-yellow-400 to-yellow-500 dark:from-yellow-300 dark:to-yellow-500',
};

/**
 * Solid button color classes
 * Used for primary CTAs and action buttons
 */
export const buttonColorClasses: Record<string, string> = {
  blue: 'text-white bg-blue-500 hover:bg-blue-600 bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-400 hover:to-blue-500',
  teal: 'text-white bg-teal-500 hover:bg-teal-600 bg-gradient-to-r from-teal-400 to-teal-600 hover:from-teal-400 hover:to-teal-500',
  green:
    'text-white bg-green-500 hover:bg-green-600 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-400 hover:to-green-500',
  red: 'text-white bg-red-500 hover:bg-red-600 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500',
  pink: 'text-white bg-pink-500 hover:bg-pink-600 bg-gradient-to-r from-pink-400 to-pink-600 hover:from-pink-400 hover:to-pink-500',
  purple:
    'text-white bg-purple-500 hover:bg-purple-600 bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-400 hover:to-purple-500',
  orange:
    'text-white bg-orange-500 hover:bg-orange-600 bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-400 hover:to-orange-500',
  yellow:
    'text-gray-800 bg-yellow-500 hover:bg-yellow-600 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500',
};

/**
 * Inverted button color classes (light background with colored text)
 * Used for secondary buttons
 */
export const invertedButtonColorClasses: Record<string, string> = {
  blue: 'text-blue-500 bg-white hover:bg-gray-50 bg-gradient-to-r from-gray-50 to-white hover:to-gray-100',
  teal: 'text-teal-500 bg-white hover:bg-gray-50 bg-gradient-to-r from-gray-50 to-white hover:to-gray-100',
  green:
    'text-green-500 bg-white hover:bg-gray-50 bg-gradient-to-r from-gray-50 to-white hover:to-gray-100',
  red: 'text-red-500 bg-white hover:bg-gray-50 bg-gradient-to-r from-gray-50 to-white hover:to-gray-100',
  pink: 'text-pink-500 bg-white hover:bg-gray-50 bg-gradient-to-r from-gray-50 to-white hover:to-gray-100',
  purple:
    'text-purple-500 bg-white hover:bg-gray-50 bg-gradient-to-r from-gray-50 to-white hover:to-gray-100',
  orange:
    'text-orange-500 bg-white hover:bg-gray-50 bg-gradient-to-r from-gray-50 to-white hover:to-gray-100',
  yellow:
    'text-yellow-500 bg-white hover:bg-gray-50 bg-gradient-to-r from-gray-50 to-white hover:to-gray-100',
};

/**
 * Link-style button color classes (text only, no background)
 * Used for tertiary/subtle buttons
 */
export const linkButtonColorClasses: Record<string, string> = {
  blue: 'text-blue-600 dark:text-blue-400 hover:text-blue-400 dark:hover:text-blue-200',
  teal: 'text-teal-600 dark:text-teal-400 hover:text-teal-400 dark:hover:text-teal-200',
  green:
    'text-green-600 dark:text-green-400 hover:text-green-400 dark:hover:text-green-200',
  red: 'text-red-600 dark:text-red-400 hover:text-red-400 dark:hover:text-red-200',
  pink: 'text-pink-600 dark:text-pink-400 hover:text-pink-400 dark:hover:text-pink-200',
  purple:
    'text-purple-600 dark:text-purple-400 hover:text-purple-400 dark:hover:text-purple-200',
  orange:
    'text-orange-600 dark:text-orange-400 hover:text-orange-400 dark:hover:text-orange-200',
  yellow:
    'text-yellow-600 dark:text-yellow-400 hover:text-yellow-400 dark:hover:text-yellow-200',
};

/**
 * Hero/headline background gradient color classes
 * Used in hero blocks and section headlines
 */
export const headlineColorClasses: Record<string, string> = {
  blue: 'from-blue-400 to-blue-600',
  teal: 'from-teal-400 to-teal-600',
  green: 'from-green-400 to-green-600',
  red: 'from-red-400 to-red-600',
  pink: 'from-pink-400 to-pink-600',
  purple: 'from-purple-400 to-purple-600',
  orange: 'from-orange-300 to-orange-600',
  yellow: 'from-yellow-400 to-yellow-800',
};

/**
 * Header background color classes
 * Maps to both default and primary color variants
 */
export const headerColorClasses: Record<string, string> = {
  default:
    'text-gray-800 dark:text-gray-50 from-white to-gray-50 dark:from-gray-900 dark:to-gray-1000',
  blue: 'text-white from-blue-500 to-blue-700',
  teal: 'text-white from-teal-500 to-teal-600',
  green: 'text-white from-green-500 to-green-600',
  red: 'text-white from-red-500 to-red-600',
  pink: 'text-white from-pink-500 to-pink-600',
  purple: 'text-white from-purple-500 to-purple-600',
  orange: 'text-white from-orange-500 to-orange-600',
  yellow: 'text-white from-yellow-500 to-yellow-600',
};

/**
 * Active navigation item border color classes
 * Used in header for active link indicators
 */
export const activeItemClasses: Record<string, string> = {
  blue: 'border-b-3 border-blue-200',
  teal: 'border-b-3 border-teal-200',
  green: 'border-b-3 border-green-200',
  red: 'border-b-3 border-red-200',
  pink: 'border-b-3 border-pink-200',
  purple: 'border-b-3 border-purple-200',
  orange: 'border-b-3 border-orange-200',
  yellow: 'border-b-3 border-yellow-200',
};

/**
 * Background color classes for active navigation items
 * Used in header for active text color
 */
export const activeBackgroundClasses: Record<string, string> = {
  blue: 'text-blue-600 dark:text-blue-300',
  teal: 'text-teal-600 dark:text-teal-300',
  green: 'text-green-600 dark:text-green-300',
  red: 'text-red-600 dark:text-red-300',
  pink: 'text-pink-600 dark:text-pink-300',
  purple: 'text-purple-600 dark:text-purple-300',
  orange: 'text-orange-600 dark:text-orange-300',
  yellow: 'text-yellow-600 dark:text-yellow-300',
};
