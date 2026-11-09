import type { UserId } from '../core/auth/contract';
import type { TinaDocument } from '../core/schema/types';
import { isRecord } from '../utils/is-record';
import type { FormId } from './form-store';

const DRAFT_KEY_PREFIX = 'tina-drafts:';
const USER_DRAFT_KEY_PREFIX = 'tina-drafts@';
const DRAFT_VERSION = 2;

// `undefined` scopes drafts to a project with no auth plugin; `null` marks a
// signed-out or loading session under an auth plugin, where drafts stay off.
export type DraftUserScope = UserId | null | undefined;

export interface StoredDraft {
  readonly values: TinaDocument;
  readonly baseline: TinaDocument;
}

// A draft belongs to the branch it was typed on. The default branch has no
// branch part, so its key never changes.
export const draftKey = (formId: FormId, userId?: UserId, branch?: string) => {
  const suffix = branch ? `@@${encodeURIComponent(branch)}` : '';
  return userId === undefined
    ? `${DRAFT_KEY_PREFIX}${formId}${suffix}`
    : `${USER_DRAFT_KEY_PREFIX}${encodeURIComponent(userId)}:${formId}${suffix}`;
};

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
export const readDraft = (
  formId: FormId,
  userId?: DraftUserScope,
  branch?: string
): StoredDraft | undefined => {
  if (userId === null) return undefined;
  const raw = storage()?.getItem(draftKey(formId, userId, branch));
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
export const writeDraft = (
  formId: FormId,
  draft: StoredDraft,
  userId?: DraftUserScope,
  branch?: string
) => {
  if (userId === null) return;
  try {
    storage()?.setItem(
      draftKey(formId, userId, branch),
      JSON.stringify({ version: DRAFT_VERSION, ...draft })
    );
  } catch (cause) {
    console.warn('[tinacms] could not store the draft:', cause);
  }
};

export const removeDraft = (
  formId: FormId,
  userId?: DraftUserScope,
  branch?: string
) => {
  if (userId === null) return;
  storage()?.removeItem(draftKey(formId, userId, branch));
};

/** The forms with a valid stored draft for this editor on this branch. */
export const listStoredDraftIds = (
  userId?: DraftUserScope,
  branch?: string
): FormId[] => {
  if (userId === null) return [];
  const store = storage();
  if (!store) return [];
  const suffix = branch ? `@@${encodeURIComponent(branch)}` : '';
  const prefix =
    userId === undefined
      ? DRAFT_KEY_PREFIX
      : `${USER_DRAFT_KEY_PREFIX}${encodeURIComponent(userId)}:`;
  const ids: FormId[] = [];
  for (let at = 0; at < store.length; at++) {
    const key = store.key(at);
    if (!key?.startsWith(prefix) || !key.endsWith(suffix)) continue;
    const id = key.slice(prefix.length, key.length - suffix.length);
    if (id.length === 0 || (!branch && id.includes('@@'))) continue;
    const formId = id as FormId;
    if (readDraft(formId, userId, branch)) ids.push(formId);
  }
  return ids;
};
