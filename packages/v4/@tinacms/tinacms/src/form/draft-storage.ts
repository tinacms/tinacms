import type { PersistStorage } from 'zustand/middleware';

export type PersistedDrafts = { forms: Record<string, unknown> };

export type StoredDraft =
  | { readonly changed: false }
  | { readonly changed: true; readonly draft: unknown };

// Each document's draft lives under its own key. A tab remembers what it last read
// or wrote per key, writes or removes only the keys it changed, and reads a
// document's draft only when that document opens. Another tab's drafts are never
// overwritten with a stale copy, and a draft another tab saved or replaced is
// noticed the next time its form opens here.
export const createDraftStorage = (
  name: string,
  version: number,
  storage: () => Storage = () => localStorage
) => {
  const known = new Map<string, string>();
  const keyOf = (formId: string) => `${name}:${formId}`;

  const parse = (raw: string): unknown => {
    try {
      const entry: { version?: unknown; draft?: unknown } = JSON.parse(raw);
      return entry.version === version ? entry.draft : undefined;
    } catch {
      return undefined;
    }
  };

  const peek = (formId: string): StoredDraft => {
    const key = keyOf(formId);
    const raw = storage().getItem(key);
    if (raw === (known.get(key) ?? null)) return { changed: false };
    return { changed: true, draft: raw === null ? undefined : parse(raw) };
  };

  const persist: PersistStorage<PersistedDrafts> = {
    getItem: () => {
      known.clear();
      return null;
    },
    setItem: (_name, value) => {
      const written = new Set<string>();
      for (const [formId, draft] of Object.entries(value.state.forms)) {
        const key = keyOf(formId);
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
    removeItem: () => {
      for (const key of Object.keys(storage())) {
        if (key.startsWith(`${name}:`)) storage().removeItem(key);
      }
      known.clear();
    },
  };

  return { peek, persist };
};
