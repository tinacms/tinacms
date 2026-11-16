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
  /** Holds only values that lost to another copy when Resume ran. */
  readonly leftover?: boolean;
  /** Marks a document that has no file yet. A draft stored before this marker reads as not new. */
  readonly new?: true;
}

// A draft belongs to the branch it was typed on. The default branch has no
// branch part, so its key never changes.
export const draftKey = (formId: FormId, userId?: UserId, branch?: string) => {
  const suffix = branch ? `@@${encodeURIComponent(branch)}` : '';
  return userId === undefined
    ? `${DRAFT_KEY_PREFIX}${formId}${suffix}`
    : `${USER_DRAFT_KEY_PREFIX}${encodeURIComponent(userId)}:${formId}${suffix}`;
};

// The live copy holds what the form holds now. Waiting copies sit in a second
// key, oldest first, until the editor picks Resume or a confirmed Discard.
const WAITING_SUFFIX = '#waiting';
const waitingKey = (formId: FormId, userId?: DraftUserScope, branch?: string) =>
  `${draftKey(formId, userId ?? undefined, branch)}${WAITING_SUFFIX}`;

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

/** `off` means the browser has no storage, so nothing is stored and nothing warns. */
export type StoreResult = 'ok' | 'failed' | 'off';

const asDraft = (entry: unknown): StoredDraft | undefined => {
  if (!isRecord(entry)) return undefined;
  if (!isRecord(entry.values) || !isRecord(entry.baseline)) return undefined;
  if (hasBlankName(entry.values) || hasBlankName(entry.baseline)) {
    return undefined;
  }
  return {
    values: entry.values,
    baseline: entry.baseline,
    ...(entry.leftover === true ? { leftover: true } : {}),
    ...(entry.new === true ? { new: true } : {}),
  };
};

// Storage is untrusted: an entry from another version or in an unknown shape is
// treated as no draft.
const readJson = (key: string): Record<string, unknown> | undefined => {
  const raw = storage()?.getItem(key);
  if (raw == null) return undefined;
  let entry: unknown;
  try {
    entry = JSON.parse(raw);
  } catch {
    return undefined;
  }
  if (!isRecord(entry) || entry.version !== DRAFT_VERSION) return undefined;
  return entry;
};

export const readDraft = (
  formId: FormId,
  userId?: DraftUserScope,
  branch?: string
): StoredDraft | undefined => {
  if (userId === null) return undefined;
  const entry = readJson(draftKey(formId, userId, branch));
  return entry ? asDraft(entry) : undefined;
};

/** The copies that wait for Resume or Discard, oldest first. */
export const readWaitingDrafts = (
  formId: FormId,
  userId?: DraftUserScope,
  branch?: string
): StoredDraft[] => {
  if (userId === null) return [];
  const entry = readJson(waitingKey(formId, userId, branch));
  if (!entry || !Array.isArray(entry.copies)) return [];
  return entry.copies.flatMap((copy) => asDraft(copy) ?? []);
};

// A failed write (quota, private mode) must never break editing. The caller
// decides what a failure means, so this only reports it.
const writeJson = (key: string, body: Record<string, unknown>): StoreResult => {
  const store = storage();
  if (!store) return 'off';
  try {
    store.setItem(key, JSON.stringify({ version: DRAFT_VERSION, ...body }));
    return 'ok';
  } catch (cause) {
    console.warn('[tinacms] could not store the draft:', cause);
    return 'failed';
  }
};

export const writeDraft = (
  formId: FormId,
  draft: StoredDraft,
  userId?: DraftUserScope,
  branch?: string
): StoreResult =>
  userId === null
    ? 'off'
    : writeJson(draftKey(formId, userId, branch), { ...draft });

export const removeDraft = (
  formId: FormId,
  userId?: DraftUserScope,
  branch?: string
) => {
  if (userId === null) return;
  storage()?.removeItem(draftKey(formId, userId, branch));
};

/** Replaces the whole waiting list. An empty list removes the key. */
export const writeWaitingDrafts = (
  formId: FormId,
  copies: readonly StoredDraft[],
  userId?: DraftUserScope,
  branch?: string
): StoreResult => {
  if (userId === null) return 'off';
  if (copies.length === 0) {
    storage()?.removeItem(waitingKey(formId, userId, branch));
    return storage() ? 'ok' : 'off';
  }
  return writeJson(waitingKey(formId, userId, branch), { copies });
};

/**
 * Appends the live copy to the waiting list, then frees the live slot. The live
 * copy stays where it is until the waiting write is confirmed.
 */
export const setDraftAside = (
  formId: FormId,
  draft: StoredDraft,
  userId?: DraftUserScope,
  branch?: string
): StoreResult => {
  const result = writeWaitingDrafts(
    formId,
    [...readWaitingDrafts(formId, userId, branch), draft],
    userId,
    branch
  );
  if (result === 'ok') removeDraft(formId, userId, branch);
  return result;
};

/** Removes the live copy and every waiting copy. Only a confirmed Discard calls this. */
export const removeAllDrafts = (
  formId: FormId,
  userId?: DraftUserScope,
  branch?: string
) => {
  removeDraft(formId, userId, branch);
  writeWaitingDrafts(formId, [], userId, branch);
};

/** The forms with a valid stored copy, live or waiting, for this editor on this branch. */
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
  const ids = new Set<FormId>();
  for (let at = 0; at < store.length; at++) {
    const stored = store.key(at);
    const key = stored?.endsWith(WAITING_SUFFIX)
      ? stored.slice(0, -WAITING_SUFFIX.length)
      : stored;
    if (!key?.startsWith(prefix) || !key.endsWith(suffix)) continue;
    const id = key.slice(prefix.length, key.length - suffix.length);
    if (id.length === 0 || (!branch && id.includes('@@'))) continue;
    const formId = id as FormId;
    if (
      readDraft(formId, userId, branch) ||
      readWaitingDrafts(formId, userId, branch).length > 0
    ) {
      ids.add(formId);
    }
  }
  return [...ids];
};

/**
 * Moves every stored copy of a form, live and waiting, to a new form id. The
 * copies of `to` stay; a moved live copy waits behind a live copy already there.
 */
export const moveDrafts = (
  from: FormId,
  to: FormId,
  userId?: DraftUserScope,
  branch?: string
): void => {
  if (userId === null || from === to) return;
  const live = readDraft(from, userId, branch);
  const waiting = readWaitingDrafts(from, userId, branch);
  if (!live && waiting.length === 0) return;
  const keptWaiting = readWaitingDrafts(to, userId, branch);
  const movedLive = live && !readDraft(to, userId, branch) ? live : undefined;
  const aside = live && !movedLive ? [live] : [];
  if (movedLive) writeDraft(to, movedLive, userId, branch);
  const copies = [...keptWaiting, ...waiting, ...aside];
  if (copies.length > 0) writeWaitingDrafts(to, copies, userId, branch);
  removeAllDrafts(from, userId, branch);
};
