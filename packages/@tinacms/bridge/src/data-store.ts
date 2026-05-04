import type { DataStore } from './types';

/**
 * Holds the latest resolved data per form id (keyed by `hashFromQuery`-style
 * id). `seed()` populates the initial server-rendered payload silently so
 * the bridge doesn't trigger a refresh on page load. `set()` records edits
 * from the admin and fires subscribers; `firstUpdate` is true only for the
 * first admin update per id (used by island-refresh to skip the debounce
 * on cold-start so newly-created docs reach a populated state ASAP).
 */
export function initDataStore(): DataStore {
  const data = new Map<string, object>();
  const updated = new Set<string>();
  const listeners = new Set<
    (event: { id: string; firstUpdate: boolean }) => void
  >();

  return {
    get: (id) => data.get(id),
    seed(id, next) {
      data.set(id, next);
    },
    set(id, next) {
      const firstUpdate = !updated.has(id);
      updated.add(id);
      data.set(id, next);
      for (const listener of listeners) listener({ id, firstUpdate });
    },
    ids: () => Array.from(data.keys()),
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
