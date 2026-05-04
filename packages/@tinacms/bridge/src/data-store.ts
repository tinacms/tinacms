import type { DataStore } from './types';

/**
 * Holds the latest resolved data per form id (keyed by `hashFromQuery`-style
 * id). Subscribers learn whether each update is the first one for that form,
 * so island-refresh can fire immediately on the first push (newly-created
 * docs reach a populated state ASAP) and debounce subsequent edits.
 */
export function initDataStore(): DataStore {
  const data = new Map<string, object>();
  const seen = new Set<string>();
  const listeners = new Set<(event: { id: string; firstUpdate: boolean }) => void>();

  return {
    get: (id) => data.get(id),
    set(id, next) {
      const firstUpdate = !seen.has(id);
      seen.add(id);
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
