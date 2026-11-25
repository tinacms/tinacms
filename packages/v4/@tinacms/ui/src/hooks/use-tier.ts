import { useSyncExternalStore } from 'react';

export type Tier = 'phone' | 'tablet' | 'desktop';

/** Used when `tokens.css` is not loaded (jsdom). A test pins them to the tokens. */
export const TABLET_MIN_WIDTH = 768;
export const DESKTOP_MIN_WIDTH = 1280;

let cachedQueries: string[] | null = null;

const tokenQuery = (name: string, fallbackPx: number): string => {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return `(min-width: ${value === '' ? `${fallbackPx}px` : value})`;
};

const queries = (): string[] => {
  cachedQueries ??= [
    tokenQuery('--breakpoint-tablet', TABLET_MIN_WIDTH),
    tokenQuery('--breakpoint-desktop', DESKTOP_MIN_WIDTH),
  ];
  return cachedQueries;
};

/** Forgets the token read. Tests that change a token call it. */
export const resetTierQueries = () => {
  cachedQueries = null;
};

const tierNow = (): Tier => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'desktop';
  const [tablet, desktop] = queries().map(
    (query) => window.matchMedia(query).matches
  );
  if (desktop) return 'desktop';
  return tablet ? 'tablet' : 'phone';
};

const subscribe = (notify: () => void) => {
  if (!window.matchMedia) return () => {};
  const lists = queries().map((query) => window.matchMedia(query));
  for (const list of lists) list.addEventListener('change', notify);
  return () => {
    for (const list of lists) list.removeEventListener('change', notify);
  };
};

/**
 * The width tier of the window: phone below `--breakpoint-tablet` (768px), tablet below
 * `--breakpoint-desktop` (1280px), desktop from there. It follows the window, not the
 * element that reads it.
 */
export function useTier(): Tier {
  return useSyncExternalStore(subscribe, tierNow, () => 'desktop');
}
