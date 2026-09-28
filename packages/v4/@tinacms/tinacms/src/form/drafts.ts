import type { TinaDocument } from '../core/schema/types';

const DRAFT_KEY_PREFIX = 'tina-drafts:';
const DRAFT_VERSION = 1;

export interface StoredDraft {
  readonly values: TinaDocument;
  readonly baseline: TinaDocument;
}

export const draftKey = (formId: string) => `${DRAFT_KEY_PREFIX}${formId}`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasBlankName = (fields: Record<string, unknown>) =>
  Object.keys(fields).some((name) => name.length === 0);

// A browser that blocks site data throws when code reads localStorage. Drafts
// then stay off, and forms open as if no draft exists.
const storage = (): Storage | undefined => {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
};

// Storage is untrusted: an entry from another version or in an unknown shape is
// treated as no draft.
export const readDraft = (formId: string): StoredDraft | undefined => {
  const raw = storage()?.getItem(draftKey(formId));
  if (raw == null) return undefined;
  let entry: unknown;
  try {
    entry = JSON.parse(raw);
  } catch {
    return undefined;
  }
  if (!isRecord(entry) || entry.version !== DRAFT_VERSION) return undefined;
  if (!isRecord(entry.values) || !isRecord(entry.baseline)) return undefined;
  if (hasBlankName(entry.values) || hasBlankName(entry.baseline)) {
    return undefined;
  }
  return { values: entry.values, baseline: entry.baseline };
};

// A failed write (quota, private mode) must never break editing, so it only warns.
export const writeDraft = (formId: string, draft: StoredDraft) => {
  try {
    storage()?.setItem(
      draftKey(formId),
      JSON.stringify({ version: DRAFT_VERSION, ...draft })
    );
  } catch (cause) {
    console.warn('[tinacms] could not store the draft:', cause);
  }
};

export const removeDraft = (formId: string) => {
  storage()?.removeItem(draftKey(formId));
};
