import { useSyncExternalStore } from 'react';

// Below this width the form bar spans the screen and a toast in the corner would
// cover Save, so toasts sit above the bar and stack their actions.
const NARROW_QUERY = '(max-width: 1023px)';

const subscribe = (notify: () => void) => {
  const query = window.matchMedia(NARROW_QUERY);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
};

const read = () => window.matchMedia(NARROW_QUERY).matches;

export const useNarrow = () =>
  useSyncExternalStore(subscribe, read, () => false);
