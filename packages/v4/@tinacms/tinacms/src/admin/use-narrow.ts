import { useSyncExternalStore } from 'react';

// Below this width the form bar spans the screen and a toast in the corner would
// cover Save, so toasts stack their actions.
const NARROW_QUERY = '(max-width: 1023px)';

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
