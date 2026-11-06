import { useSyncExternalStore } from 'react';

// Below this width the form bar spans the screen and a toast in the corner would
// cover Save, so toasts stack their actions.
const NARROW_QUERY = '(max-width: 1023px)';
// A screen this short is a phone with its keyboard open.
const SHORT_QUERY = '(max-height: 400px)';

const useMedia = (query: string) =>
  useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', notify);
      return () => list.removeEventListener('change', notify);
    },
    () => window.matchMedia(query).matches,
    () => false
  );

export const useNarrow = () => useMedia(NARROW_QUERY);
export const useShortScreen = () => useMedia(SHORT_QUERY);
