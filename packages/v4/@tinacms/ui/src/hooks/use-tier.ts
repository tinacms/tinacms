import { useSyncExternalStore } from 'react';

export type Tier = 'phone' | 'tablet' | 'desktop';

export const TABLET_MIN_WIDTH = 768;
export const DESKTOP_MIN_WIDTH = 1280;

const QUERIES = [TABLET_MIN_WIDTH, DESKTOP_MIN_WIDTH].map(
  (width) => `(min-width: ${width}px)`
);

const tierNow = (): Tier => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'desktop';
  const [tablet, desktop] = QUERIES.map(
    (query) => window.matchMedia(query).matches
  );
  if (desktop) return 'desktop';
  return tablet ? 'tablet' : 'phone';
};

const subscribe = (notify: () => void) => {
  if (!window.matchMedia) return () => {};
  const lists = QUERIES.map((query) => window.matchMedia(query));
  for (const list of lists) list.addEventListener('change', notify);
  return () => {
    for (const list of lists) list.removeEventListener('change', notify);
  };
};

/**
 * The width tier of the window: phone under 768px, tablet from 768px to 1279px, desktop from
 * 1280px. It follows the window, not the element that reads it.
 */
export function useTier(): Tier {
  return useSyncExternalStore(subscribe, tierNow, () => 'desktop');
}
