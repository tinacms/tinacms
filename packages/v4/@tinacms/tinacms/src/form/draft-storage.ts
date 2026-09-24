import type { PersistStorage } from 'zustand/middleware';

export type PersistedDrafts = { forms: Record<string, unknown> };

// Each document's draft lives under its own key, and a tab writes or removes only
// the keys whose content differs from what it last read or wrote. Another tab's
// drafts are never overwritten with this tab's stale copy of them.
export const createDraftStorage = (
  version: number,
  storage: () => Storage = () => localStorage
): PersistStorage<PersistedDrafts> => {
  const known = new Map<string, string>();
  const keysOf = (name: string) =>
    Object.keys(storage()).filter((key) => key.startsWith(`${name}:`));

  return {
    getItem: (name) => {
      known.clear();
      const forms: Record<string, unknown> = {};
      for (const key of keysOf(name)) {
        const raw = storage().getItem(key);
        if (raw === null) continue;
        known.set(key, raw);
        try {
          const entry: { version?: unknown; draft?: unknown } = JSON.parse(raw);
          if (entry.version !== version) continue;
          forms[key.slice(name.length + 1)] = entry.draft;
        } catch {}
      }
      return { state: { forms }, version };
    },
    setItem: (name, value) => {
      const written = new Set<string>();
      for (const [formId, draft] of Object.entries(value.state.forms)) {
        const key = `${name}:${formId}`;
        written.add(key);
        const raw = JSON.stringify({ version, draft });
        if (known.get(key) === raw) continue;
        storage().setItem(key, raw);
        known.set(key, raw);
      }
      for (const key of known.keys()) {
        if (written.has(key)) continue;
        storage().removeItem(key);
        known.delete(key);
      }
    },
    removeItem: (name) => {
      for (const key of keysOf(name)) storage().removeItem(key);
      known.clear();
    },
  };
};
