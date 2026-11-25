import { useSyncExternalStore } from 'react';

const COARSE = '(pointer: coarse)';

const touchNow = (): boolean =>
  typeof window !== 'undefined' &&
  (document.documentElement.hasAttribute('data-touch') ||
    (!!window.matchMedia && window.matchMedia(COARSE).matches));

const subscribe = (notify: () => void) => {
  const list = window.matchMedia?.(COARSE);
  list?.addEventListener('change', notify);
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-touch'],
  });
  return () => {
    list?.removeEventListener('change', notify);
    observer.disconnect();
  };
};

/**
 * True when the primary pointer is coarse (a finger), or `<html>` has `data-touch`.
 * Only `<html>` counts here; a `[data-touch]` frame lower down changes sizes through the
 * `touch:` variant alone.
 */
export function useTouch(): boolean {
  return useSyncExternalStore(subscribe, touchNow, () => false);
}
