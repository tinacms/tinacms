import { useMemo } from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import type { Brand } from '../core/brand';
import { type FieldAddress, toFieldAddress } from '../core/field/address';
import {
  type FieldEquality,
  STRUCTURAL_EQUALITY,
  sameValue,
} from '../core/form/compare';
import { invariant } from '../core/invariant';
import type { TinaDocument } from '../core/schema/types';
import {
  type DraftUserScope,
  listStoredDraftIds,
  readDraft,
  readWaitingDrafts,
  removeAllDrafts,
  removeDraft,
  setDraftAside,
  type StoredDraft,
  type StoreResult,
  writeDraft,
  writeWaitingDrafts,
} from './drafts';
import { resumeWaiting } from './resume';

export type FormId = Brand<string, 'FormId'>;

export const toFormId = (path: string): FormId => {
  invariant(
    path.length > 0,
    'form-id-empty',
    'A form id must be a non-empty path.'
  );
  return path as FormId;
};

export type FormValues = Record<FieldAddress, unknown>;

export const toFormValues = (document: TinaDocument): FormValues => {
  const values: FormValues = {};
  for (const [name, value] of Object.entries(document)) {
    values[toFieldAddress(name)] = value;
  }
  return values;
};

export const toDocument = (values: FormValues): TinaDocument => ({ ...values });

export type FormStatus = 'pristine' | 'dirty' | 'clean';

/** One form's last save, written by `useFormSave` and read by the shell. */
export type SaveFailureReason = 'conflict' | 'branch-gone';

export type SavePhase =
  | { readonly phase: 'saving' }
  | { readonly phase: 'saved' }
  | {
      readonly phase: 'failed';
      readonly message: string;
      readonly reason?: SaveFailureReason;
    };

/** How one document ended in the latest Save All run. */
export type SaveAllResult =
  | { readonly status: 'saved' }
  | { readonly status: 'saved-with-warning' }
  | { readonly status: 'failed'; readonly words: string }
  | { readonly status: 'not-saved'; readonly words: string };

export interface SaveAllState {
  /** Set from the start of a run to its end, so nothing re-enables between documents. */
  readonly running: { readonly index: number; readonly total: number } | null;
  /** The documents of the latest run, in the order they were saved. */
  readonly results: Partial<Record<FormId, SaveAllResult>>;
  /** The save-phase counter when the run ended. A save phase stamped later is newer than the run. */
  readonly endedAt: number | null;
  /** Set once a single save starts after the run ended. The run's words then leave the Status bar. */
  readonly superseded: boolean;
  /** The documents the run tried, skipped ones excluded. Fixed when the run ends. */
  readonly attempted: number;
}

export const IDLE_SAVE_ALL: SaveAllState = {
  running: null,
  results: {},
  endedAt: null,
  superseded: false,
  attempted: 0,
};

export type FieldErrors = Partial<Record<FieldAddress, string[]>>;

type OpenForm =
  | {
      readonly status: 'pristine';
      readonly values: FormValues;
      readonly equal: FieldEquality;
    }
  | {
      readonly status: 'edited';
      readonly values: FormValues;
      readonly baseline: FormValues;
      readonly errors: FieldErrors;
      readonly equal: FieldEquality;
    };

export const isEdited = (
  scope: OpenForm | undefined
): scope is Extract<OpenForm, { status: 'edited' }> =>
  scope?.status === 'edited';

export interface FormStore {
  userId: DraftUserScope;
  forms: Partial<Record<FormId, OpenForm>>;
  /** The latest save of each form, with a counter so the newest wins. */
  saves: Partial<Record<FormId, SavePhase & { readonly at: number }>>;
  branch: string | undefined;
  /** Counts changes to stored drafts, so lists of them refresh. */
  draftsVersion: number;
  /** The copies that wait for Resume or Discard, oldest first, per open form. */
  waiting: Partial<Record<FormId, readonly StoredDraft[]>>;
  /** Forms whose draft could not be moved aside: it still sits in the live slot. */
  held: Partial<Record<FormId, true>>;
  /** Forms whose newest edits are not confirmed written to storage. */
  unstored: Partial<Record<FormId, true>>;
  /** Counts failed writes per form, so the warning shows even when a later write succeeds. */
  failures: Partial<Record<FormId, number>>;
  /** Counts failed swaps per form. A swap that does nothing must say so every time. */
  swapFailures: Partial<Record<FormId, number>>;
  /** Forms whose Resume prompt is hidden until the document opens again, after a failed Resume. */
  hidden: Partial<Record<FormId, true>>;
  /** The collection name of each open form, so Save All finds the schema of a form that is not on screen. */
  collections: Partial<Record<FormId, string>>;
  /** Forms that failed validation in a save without a mounted form. They show their errors once when they open. */
  revealOnOpen: Partial<Record<FormId, true>>;
  /** Forms whose Save Document button is between its click and the end of its save. */
  savePending: Partial<Record<FormId, true>>;
  saveAll: SaveAllState;
  registerCollection: (formId: FormId, collection: string) => void;
  setRevealOnOpen: (formId: FormId) => void;
  clearRevealOnOpen: (formId: FormId) => void;
  setSavePending: (formId: FormId, pending: boolean) => void;
  startSaveAll: (total: number) => void;
  setSaveAllIndex: (index: number) => void;
  recordSaveAllResult: (formId: FormId, result: SaveAllResult) => void;
  endSaveAll: () => void;
  clearFailedResult: (formId: FormId) => void;
  /** Removes the live copy, every waiting copy and the in-memory edits. */
  discardStoredDraft: (formId: FormId) => void;
  /**
   * Removes the waiting copies the editor saw when the confirm opened, and the live
   * copy only when it is held. A copy another tab added since stays.
   */
  discardWaiting: (formId: FormId, discarded?: readonly StoredDraft[]) => void;
  setBranch: (branch: string | undefined) => void;
  setSavePhase: (formId: FormId, phase: SavePhase) => void;
  clearSavePhase: (formId: FormId) => void;
  restoreSavePhase: (
    formId: FormId,
    previous: FormStore['saves'][FormId]
  ) => void;
  active: { formId: FormId; address: FieldAddress } | null;
  setUserId: (userId: DraftUserScope) => void;
  registerForm: (
    formId: FormId,
    values: FormValues,
    equal?: FieldEquality
  ) => void;
  setFieldValue: (
    formId: FormId,
    address: FieldAddress,
    value: unknown
  ) => void;
  setFieldErrors: (formId: FormId, errors: FieldErrors) => void;
  setActive: (formId: FormId, address: FieldAddress | null) => void;
  markSaved: (formId: FormId, savedValues?: FormValues) => void;
  discardEdits: (formId: FormId) => void;
  /** Puts the waiting copies in the form. Returns the form's new values. */
  resumeWaiting: (formId: FormId) => FormValues | undefined;
  removeForm: (formId: FormId) => void;
}

export const valuesEqual = (
  current: FormValues,
  baseline: FormValues,
  equal: FieldEquality
): boolean => {
  const keys = new Set([
    ...Object.keys(current),
    ...Object.keys(baseline),
  ]) as Set<FieldAddress>;
  return [...keys].every((key) => equal(key, current[key], baseline[key]));
};

export const formStatus = (scope: OpenForm | undefined): FormStatus => {
  if (!isEdited(scope)) return 'pristine';
  return valuesEqual(scope.values, scope.baseline, scope.equal)
    ? 'clean'
    : 'dirty';
};

// The edited state also covers a clean form, so a clean form must not keep values that
// hide a changed document. A dirty form keeps its edits across mounts. A clean form
// keeps its values only while the document matches the baseline of the last save. A
// different document shows that another writer changed the file after the save.
export const keepsValues = (
  scope: OpenForm | undefined,
  incoming: FormValues
): scope is Extract<OpenForm, { status: 'edited' }> => {
  if (!isEdited(scope)) return false;
  if (formStatus(scope) === 'dirty') return true;
  return valuesEqual(scope.baseline, incoming, scope.equal);
};

type EditedForm = Extract<OpenForm, { status: 'edited' }>;

// A form opens on this tab's own edits when they still match the document. A stored
// draft never applies on open: it waits for Resume.
const openingScope = (
  scope: OpenForm | undefined,
  incoming: FormValues
): EditedForm | undefined => (keepsValues(scope, incoming) ? scope : undefined);

const toWaitingCopy = (copy: StoredDraft) => ({
  values: toFormValues(copy.values),
  baseline: toFormValues(copy.baseline),
  leftover: copy.leftover,
});

const toStoredDraft = (copy: {
  values: FormValues;
  baseline: FormValues;
  leftover?: boolean;
}): StoredDraft => ({
  values: toDocument(copy.values),
  baseline: toDocument(copy.baseline),
  ...(copy.leftover ? { leftover: true } : {}),
});

const sameDraft = (a: StoredDraft, b: StoredDraft) =>
  JSON.stringify(a) === JSON.stringify(b);

const withFailure = (
  failures: Partial<Record<FormId, number>>,
  formId: FormId
) => ({ ...failures, [formId]: (failures[formId] ?? 0) + 1 });

const withoutKey = <T>(record: Partial<Record<FormId, T>>, formId: FormId) => {
  const { [formId]: _gone, ...rest } = record;
  return rest;
};

const withoutFailedResult = (saveAll: SaveAllState, formId: FormId) => {
  const status = saveAll.results[formId]?.status;
  if (status !== 'failed' && status !== 'not-saved') return saveAll;
  return { ...saveAll, results: withoutKey(saveAll.results, formId) };
};

export const formEntries = <T>(
  record: Partial<Record<FormId, T>>
): [FormId, T][] =>
  (Object.entries(record) as [FormId, T | undefined][]).flatMap(
    ([formId, value]): [FormId, T][] =>
      value === undefined ? [] : [[formId, value]]
  );

const storeFailed = (...results: StoreResult[]) =>
  results.some((result) => result === 'failed');

// Moves a draft found on open out of the live slot, so new edits cannot overwrite
// it. A copy equal to the file holds nothing unsaved and goes. A copy that cannot
// be written aside stays where it is and the form holds its edits in memory.
const settleStoredDrafts = (
  formId: FormId,
  incoming: FormValues,
  equal: FieldEquality,
  userId: DraftUserScope,
  branch: string | undefined,
  alreadyHeld: boolean
): { held: boolean; failed: boolean } => {
  const saved = (copy: StoredDraft) =>
    valuesEqual(toFormValues(copy.values), incoming, equal);
  let held = alreadyHeld;
  let failed = false;
  const live = readDraft(formId, userId, branch);
  if (live && !alreadyHeld) {
    if (saved(live)) {
      removeDraft(formId, userId, branch);
    } else if (setDraftAside(formId, live, userId, branch) === 'failed') {
      held = true;
      failed = true;
    }
  }
  const waiting = readWaitingDrafts(formId, userId, branch);
  const remaining = waiting.filter((copy) => !saved(copy));
  if (remaining.length !== waiting.length) {
    const result = writeWaitingDrafts(formId, remaining, userId, branch);
    failed = failed || storeFailed(result);
  }
  return { held, failed };
};

const waitingOf = (
  formId: FormId,
  userId: DraftUserScope,
  branch: string | undefined,
  held: boolean
): readonly StoredDraft[] => {
  const live = held ? readDraft(formId, userId, branch) : undefined;
  const waiting = readWaitingDrafts(formId, userId, branch);
  return live ? [...waiting, live] : waiting;
};

export const fieldDirty = (
  scope: OpenForm | undefined,
  address: FieldAddress
): boolean =>
  isEdited(scope)
    ? !scope.equal(address, scope.values[address], scope.baseline[address])
    : false;

const errorsEqual = (current: FieldErrors, next: FieldErrors): boolean =>
  JSON.stringify(current) === JSON.stringify(next);

const DEVTOOLS_STORE_NAME = 'TinaFormStore';
const DEVTOOLS_ACTION = {
  setUserId: 'form/setUserId',
  setBranch: 'form/setBranch',
  discardStoredDraft: 'form/discardStoredDraft',
  discardWaiting: 'form/discardWaiting',
  storage: 'form/storage',
  setSavePhase: 'form/setSavePhase',
  clearSavePhase: 'form/clearSavePhase',
  restoreSavePhase: 'form/restoreSavePhase',
  register: 'form/register',
  setFieldValue: 'form/setFieldValue',
  setFieldErrors: 'form/setFieldErrors',
  setActive: 'form/setActive',
  markSaved: 'form/markSaved',
  discardEdits: 'form/discardEdits',
  resumeWaiting: 'form/resumeWaiting',
  removeForm: 'form/removeForm',
  registerCollection: 'form/registerCollection',
  revealOnOpen: 'form/revealOnOpen',
  savePending: 'form/savePending',
  saveAll: 'form/saveAll',
} as const;
type DevtoolsActionLabel =
  (typeof DEVTOOLS_ACTION)[keyof typeof DEVTOOLS_ACTION];

let savePhaseClock = 0;

export const useFormStore = create<FormStore>()(
  devtools(
    (set) => {
      const apply = (
        patch: (state: FormStore) => FormStore | Partial<FormStore>,
        action: DevtoolsActionLabel
      ) => set(patch, false, action);

      return {
        userId: undefined,
        forms: {},
        saves: {},
        branch: undefined,
        draftsVersion: 0,
        waiting: {},
        held: {},
        unstored: {},
        failures: {},
        swapFailures: {},
        hidden: {},
        active: null,
        collections: {},
        revealOnOpen: {},
        savePending: {},
        saveAll: IDLE_SAVE_ALL,

        registerCollection: (formId, collection) =>
          apply((state) => {
            if (state.collections[formId] === collection) return state;
            return {
              collections: { ...state.collections, [formId]: collection },
            };
          }, DEVTOOLS_ACTION.registerCollection),

        setRevealOnOpen: (formId) =>
          apply(
            (state) => ({
              revealOnOpen: { ...state.revealOnOpen, [formId]: true },
            }),
            DEVTOOLS_ACTION.revealOnOpen
          ),

        clearRevealOnOpen: (formId) =>
          apply((state) => {
            if (!state.revealOnOpen[formId]) return state;
            return { revealOnOpen: withoutKey(state.revealOnOpen, formId) };
          }, DEVTOOLS_ACTION.revealOnOpen),

        setSavePending: (formId, pending) =>
          apply((state) => {
            if ((state.savePending[formId] === true) === pending) return state;
            return {
              savePending: pending
                ? { ...state.savePending, [formId]: true }
                : withoutKey(state.savePending, formId),
            };
          }, DEVTOOLS_ACTION.savePending),

        startSaveAll: (total) =>
          apply(
            () => ({
              saveAll: { ...IDLE_SAVE_ALL, running: { index: 0, total } },
            }),
            DEVTOOLS_ACTION.saveAll
          ),

        setSaveAllIndex: (index) =>
          apply((state) => {
            const { running } = state.saveAll;
            if (!running) return state;
            return {
              saveAll: { ...state.saveAll, running: { ...running, index } },
            };
          }, DEVTOOLS_ACTION.saveAll),

        recordSaveAllResult: (formId, result) =>
          apply(
            (state) => ({
              saveAll: {
                ...state.saveAll,
                results: { ...state.saveAll.results, [formId]: result },
              },
            }),
            DEVTOOLS_ACTION.saveAll
          ),

        endSaveAll: () =>
          apply(
            (state) => ({
              saveAll: {
                ...state.saveAll,
                running: null,
                endedAt: ++savePhaseClock,
                attempted: Object.keys(state.saveAll.results).length,
              },
            }),
            DEVTOOLS_ACTION.saveAll
          ),

        clearFailedResult: (formId) =>
          apply((state) => {
            const saveAll = withoutFailedResult(state.saveAll, formId);
            return saveAll === state.saveAll ? state : { saveAll };
          }, DEVTOOLS_ACTION.saveAll),

        discardStoredDraft: (formId) => {
          const { userId, branch } = readFormStore();
          removeAllDrafts(formId, userId, branch);
          apply((state) => {
            const { [formId]: _form, ...forms } = state.forms;
            const { [formId]: _waiting, ...waiting } = state.waiting;
            const { [formId]: _held, ...held } = state.held;
            const { [formId]: _unstored, ...unstored } = state.unstored;
            return {
              forms,
              waiting,
              held,
              unstored,
              revealOnOpen: withoutKey(state.revealOnOpen, formId),
              saveAll: withoutFailedResult(state.saveAll, formId),
              draftsVersion: state.draftsVersion + 1,
            };
          }, DEVTOOLS_ACTION.discardStoredDraft);
        },

        discardWaiting: (formId, discarded) => {
          const { userId, branch, held, forms } = readFormStore();
          const scope = forms[formId];
          // What the form holds must be confirmed stored before the waiting copies
          // go, because a failed Resume or edit write may have left it in memory only.
          if (isEdited(scope) && formStatus(scope) === 'dirty') {
            const result = writeDraft(
              formId,
              {
                values: toDocument(scope.values),
                baseline: toDocument(scope.baseline),
              },
              userId,
              branch
            );
            if (result === 'failed') {
              apply(
                (state) => ({
                  unstored: { ...state.unstored, [formId]: true },
                  failures: withFailure(state.failures, formId),
                }),
                DEVTOOLS_ACTION.discardWaiting
              );
              return;
            }
          } else if (held[formId]) {
            removeDraft(formId, userId, branch);
          }
          const remaining = readWaitingDrafts(formId, userId, branch).filter(
            (copy) => !discarded.some((gone) => sameDraft(gone, copy))
          );
          writeWaitingDrafts(formId, remaining, userId, branch);
          apply((state) => {
            const { [formId]: _waiting, ...waiting } = state.waiting;
            const { [formId]: _held, ...rest } = state.held;
            const { [formId]: _unstored, ...unstored } = state.unstored;
            return {
              waiting:
                remaining.length > 0
                  ? { ...waiting, [formId]: remaining }
                  : waiting,
              held: rest,
              unstored,
              draftsVersion: state.draftsVersion + 1,
            };
          }, DEVTOOLS_ACTION.discardWaiting);
        },

        setBranch: (branch) =>
          apply((state) => {
            if (state.branch === branch) return state;
            return {
              branch,
              forms: {},
              saves: {},
              waiting: {},
              held: {},
              unstored: {},
              failures: {},
              swapFailures: {},
              hidden: {},
              active: null,
              collections: {},
              revealOnOpen: {},
              savePending: {},
              saveAll: IDLE_SAVE_ALL,
            };
          }, DEVTOOLS_ACTION.setBranch),

        setSavePhase: (formId, phase) =>
          apply((state) => {
            const at = ++savePhaseClock;
            const { endedAt, superseded } = state.saveAll;
            const newer = endedAt !== null && at > endedAt && !superseded;
            return {
              saves: { ...state.saves, [formId]: { ...phase, at } },
              ...(newer
                ? { saveAll: { ...state.saveAll, superseded: true } }
                : {}),
            };
          }, DEVTOOLS_ACTION.setSavePhase),

        clearSavePhase: (formId) =>
          apply((state) => {
            if (!state.saves[formId]) return state;
            const { [formId]: _cleared, ...saves } = state.saves;
            return { saves };
          }, DEVTOOLS_ACTION.clearSavePhase),
        restoreSavePhase: (formId, previous) =>
          apply((state) => {
            const { [formId]: _current, ...others } = state.saves;
            return {
              saves: previous ? { ...others, [formId]: previous } : others,
            };
          }, DEVTOOLS_ACTION.restoreSavePhase),

        setUserId: (userId) =>
          apply((state) => {
            if (state.userId === userId) return state;
            return {
              userId,
              forms: {},
              saves: {},
              waiting: {},
              held: {},
              unstored: {},
              failures: {},
              swapFailures: {},
              hidden: {},
              active: null,
              collections: {},
              revealOnOpen: {},
              savePending: {},
              saveAll: IDLE_SAVE_ALL,
            };
          }, DEVTOOLS_ACTION.setUserId),

        registerForm: (formId, values, equal = STRUCTURAL_EQUALITY) =>
          apply((state) => {
            const scope = state.forms[formId];
            const opening = openingScope(scope, values);
            const settled = opening
              ? { held: state.held[formId] === true, failed: false }
              : settleStoredDrafts(
                  formId,
                  values,
                  equal,
                  state.userId,
                  state.branch,
                  state.held[formId] === true
                );
            const copies = waitingOf(
              formId,
              state.userId,
              state.branch,
              settled.held
            );
            const sameCopies =
              JSON.stringify(copies) ===
              JSON.stringify(state.waiting[formId] ?? []);
            const storage = {
              waiting: sameCopies
                ? state.waiting
                : { ...state.waiting, [formId]: copies },
              held: settled.held
                ? { ...state.held, [formId]: true as const }
                : state.held,
              unstored: settled.failed
                ? { ...state.unstored, [formId]: true as const }
                : state.unstored,
              failures: settled.failed
                ? withFailure(state.failures, formId)
                : state.failures,
              hidden: opening ? state.hidden : withoutKey(state.hidden, formId),
              draftsVersion: sameCopies
                ? state.draftsVersion
                : state.draftsVersion + 1,
            };
            if (opening) {
              if (opening === scope && sameCopies) return state;
              return {
                ...storage,
                forms: { ...state.forms, [formId]: opening },
              };
            }
            return {
              ...storage,
              forms: {
                ...state.forms,
                [formId]: { status: 'pristine', values: { ...values }, equal },
              },
            };
          }, DEVTOOLS_ACTION.register),

        setFieldValue: (formId, address, value) =>
          apply((state) => {
            const scope = state.forms[formId];
            if (!scope) return state;
            if (scope.equal(address, scope.values[address], value))
              return state;
            return {
              forms: {
                ...state.forms,
                [formId]: {
                  ...scope,
                  status: 'edited',
                  values: { ...scope.values, [address]: value },
                  baseline: isEdited(scope) ? scope.baseline : scope.values,
                  errors: isEdited(scope) ? scope.errors : {},
                },
              },
            };
          }, DEVTOOLS_ACTION.setFieldValue),

        setFieldErrors: (formId, errors) =>
          apply((state) => {
            const scope = state.forms[formId];
            if (!isEdited(scope)) return state;
            if (errorsEqual(scope.errors, errors)) return state;
            return {
              forms: {
                ...state.forms,
                [formId]: { ...scope, errors: { ...errors } },
              },
            };
          }, DEVTOOLS_ACTION.setFieldErrors),

        setActive: (formId, address) =>
          apply(
            () => ({ active: address == null ? null : { formId, address } }),
            DEVTOOLS_ACTION.setActive
          ),

        markSaved: (formId, savedValues) =>
          apply((state) => {
            const scope = state.forms[formId];
            if (!scope) return state;
            return {
              forms: {
                ...state.forms,
                [formId]: {
                  ...scope,
                  status: 'edited',
                  // A caller passes the form library's own value tree, which it
                  // keeps mutating in place. The baseline must be a private
                  // snapshot or a later edit mutates it too and never reads as
                  // dirty.
                  baseline: structuredClone(savedValues ?? scope.values),
                  errors: isEdited(scope) ? scope.errors : {},
                },
              },
            };
          }, DEVTOOLS_ACTION.markSaved),

        discardEdits: (formId) =>
          apply((state) => {
            const scope = state.forms[formId];
            if (!isEdited(scope)) return state;
            const { [formId]: _failed, ...saves } = state.saves;
            return {
              saves,
              hidden: withoutKey(state.hidden, formId),
              revealOnOpen: withoutKey(state.revealOnOpen, formId),
              saveAll: withoutFailedResult(state.saveAll, formId),
              forms: {
                ...state.forms,
                [formId]: {
                  status: 'pristine',
                  values: scope.baseline,
                  equal: scope.equal,
                },
              },
            };
          }, DEVTOOLS_ACTION.discardEdits),

        resumeWaiting: (formId) => {
          const state = readFormStore();
          const scope = state.forms[formId];
          if (!scope) return undefined;
          const { userId, branch } = state;
          const document = isEdited(scope) ? scope.baseline : scope.values;
          const old = waitingOf(
            formId,
            userId,
            branch,
            state.held[formId] === true
          );
          const { values, copies, swapped } = resumeWaiting({
            document,
            current: scope.values,
            copies: old.map(toWaitingCopy),
            equal: scope.equal,
          });
          const next = copies.map(toStoredDraft);
          const dirty = !valuesEqual(values, document, scope.equal);
          // Each step runs only when the one before is confirmed, and the old copies
          // go last, so a failed write at any point leaves every value stored.
          const added = next.filter(
            (copy) => !old.some((kept) => sameDraft(kept, copy))
          );
          let failed = storeFailed(
            writeWaitingDrafts(formId, [...old, ...added], userId, branch)
          );
          if (!failed) {
            if (dirty) {
              failed = storeFailed(
                writeDraft(
                  formId,
                  {
                    values: toDocument(values),
                    baseline: toDocument(document),
                  },
                  userId,
                  branch
                )
              );
            } else {
              removeDraft(formId, userId, branch);
            }
          }
          if (!failed) {
            failed = storeFailed(
              writeWaitingDrafts(formId, next, userId, branch)
            );
          }
          // A swap that cannot be stored changes nothing, so both values stay put.
          const keep = failed && swapped;
          apply((current) => {
            const { [formId]: _held, ...held } = current.held;
            const { [formId]: _unstored, ...unstored } = current.unstored;
            return {
              forms: keep
                ? current.forms
                : {
                    ...current.forms,
                    [formId]: dirty
                      ? {
                          status: 'edited',
                          values,
                          baseline: document,
                          errors: {},
                          equal: scope.equal,
                        }
                      : {
                          status: 'pristine',
                          values: document,
                          equal: scope.equal,
                        },
                  },
              waiting: {
                ...current.waiting,
                [formId]: failed ? old : next,
              },
              held: failed && current.held[formId] ? current.held : held,
              unstored: failed
                ? { ...current.unstored, [formId]: true }
                : unstored,
              failures: failed
                ? withFailure(current.failures, formId)
                : current.failures,
              swapFailures: keep
                ? withFailure(current.swapFailures, formId)
                : current.swapFailures,
              // A swap that failed changed nothing, so its prompt stays.
              hidden:
                failed && !swapped
                  ? { ...current.hidden, [formId]: true }
                  : withoutKey(current.hidden, formId),
              draftsVersion: current.draftsVersion + 1,
            };
          }, DEVTOOLS_ACTION.resumeWaiting);
          return keep ? scope.values : values;
        },

        removeForm: (formId) =>
          apply((state) => {
            if (!state.forms[formId]) return state;
            const { [formId]: _removed, ...rest } = state.forms;
            return {
              forms: rest,
              active: state.active?.formId === formId ? null : state.active,
            };
          }, DEVTOOLS_ACTION.removeForm),
      };
    },
    { name: DEVTOOLS_STORE_NAME }
  )
);

export const readFormStore = (): FormStore => useFormStore.getState();

export const readOpeningScope = (
  formId: FormId,
  incoming: FormValues
): EditedForm | undefined =>
  openingScope(readFormStore().forms[formId], incoming);

// Mirrors this tab's edits into storage. Only forms whose scope changed in an
// update are touched, so another tab's drafts are never rewritten. A form that
// stops being dirty (saved, discarded, edited back) drops its draft; a form that
// merely leaves memory keeps it.
export const syncDrafts = () =>
  useFormStore.subscribe((next, prev) => {
    if (next.userId !== prev.userId || next.userId === null) return;
    for (const formId of Object.keys(next.forms) as FormId[]) {
      const scope = next.forms[formId];
      const before = prev.forms[formId];
      if (scope === before) continue;
      // A held draft still owns the live slot: edits stay in memory until the
      // editor resumes or discards it.
      if (next.held[formId]) continue;
      if (isEdited(scope) && formStatus(scope) === 'dirty') {
        const result = writeDraft(
          formId,
          {
            values: toDocument(scope.values),
            baseline: toDocument(scope.baseline),
          },
          next.userId,
          next.branch
        );
        markStorage(formId, result === 'failed');
      } else if (formStatus(before) === 'dirty') {
        removeDraft(formId, next.userId, next.branch);
        markStorage(formId, false);
      }
    }
  });

// Records whether the newest edits of a form are confirmed stored. Only a change
// updates the store, so the subscriber does not loop.
const markStorage = (formId: FormId, failed: boolean) => {
  const { unstored } = readFormStore();
  if ((unstored[formId] === true) === failed) return;
  useFormStore.setState(
    (state) => {
      const { [formId]: _gone, ...rest } = state.unstored;
      return {
        unstored: failed ? { ...rest, [formId]: true } : rest,
        failures: failed ? withFailure(state.failures, formId) : state.failures,
      };
    },
    false,
    DEVTOOLS_ACTION.storage
  );
};

export const useFormStatus = (formId: FormId): FormStatus =>
  useFormStore((state) => formStatus(state.forms[formId]));

export type SaveState = 'idle' | 'unsaved' | 'saving' | 'saved' | 'failed';

export interface SaveSummary {
  state: SaveState;
  /** The newest failed save's message, when `state` is `failed`. */
  message?: string;
  /** True when no form is dirty but confirmed stored edits wait for Resume or Discard. */
  kept?: boolean;
  /** Why the newest save failed, when the provider says. The Status bar words it. */
  reason?: SaveFailureReason;
  /** The file name of the document the newest save wrote, when `state` is `saved`. */
  document?: string;
  // The Save All fields stay flat: `useSaveSummary` compares them shallowly.
  /** The document Save All is on, and how many it will save, while it runs. */
  runIndex?: number;
  runTotal?: number;
  /** The documents of the latest Save All that did not save, out of those it tried. */
  runFailed?: number;
  runTried?: number;
  /** The documents the latest Save All saved, when nothing in it failed. */
  runSaved?: number;
  runWarnings?: boolean;
}

// A document the editor edited back to its saved values has nothing left to fail.
const failedIds = (state: FormStore): FormId[] =>
  formEntries(state.saveAll.results)
    .filter(
      ([formId, result]) =>
        (result.status === 'failed' || result.status === 'not-saved') &&
        formStatus(state.forms[formId]) === 'dirty'
    )
    .map(([formId]) => formId);

/**
 * One answer for the whole shell, first match wins: Save All running, a
 * Document save running, the failures of the latest Save All, then today's
 * order: newest failure, unsaved edits, newest success, idle. A single save
 * that starts after a run ends replaces the run's words for good. A form whose
 * `afterSave` hook failed during the run is written, so that phase does not count
 * as a failure; a later save attempt of the same form still does.
 */
export const summarizeSaves = (state: FormStore): SaveSummary => {
  const { running, results, superseded, attempted, endedAt } = state.saveAll;
  if (running)
    return {
      state: 'saving',
      runIndex: running.index,
      runTotal: running.total,
    };
  const entries = formEntries(state.saves).map(([formId, save]) => ({
    formId,
    ...save,
  }));
  if (entries.some((save) => save.phase === 'saving')) {
    return { state: 'saving' };
  }
  const failed = failedIds(state).length;
  if (failed > 0 && !superseded) {
    return { state: 'failed', runFailed: failed, runTried: attempted };
  }
  const newest = entries
    .filter(
      (save) =>
        !(
          save.phase === 'failed' &&
          endedAt !== null &&
          save.at < endedAt &&
          results[save.formId]?.status === 'saved-with-warning'
        )
    )
    .sort((a, b) => b.at - a.at)[0];
  if (newest?.phase === 'failed') {
    return { state: 'failed', message: newest.message, reason: newest.reason };
  }
  const written = Object.values(results).filter(
    (result) =>
      result.status === 'saved' || result.status === 'saved-with-warning'
  );
  const runSaved =
    written.length > 0 && !superseded
      ? {
          runSaved: written.length,
          runWarnings: written.some(
            (result) => result.status === 'saved-with-warning'
          ),
        }
      : {};
  if (anyFormDirty(state)) return { state: 'unsaved' };
  if (newest?.phase === 'saved') {
    return {
      state: 'saved',
      document: newest.formId.split('/').at(-1),
      ...runSaved,
    };
  }
  if (keptEdits(state)) return { state: 'idle', kept: true };
  return { state: 'idle', ...runSaved };
};

const keptEdits = (state: FormStore): boolean =>
  (Object.entries(state.waiting) as [FormId, readonly StoredDraft[]][]).some(
    ([formId, copies]) => copies.length > 0 && !state.unstored[formId]
  );

const anyFormDirty = (state: FormStore): boolean =>
  Object.values(state.forms).some((scope) => formStatus(scope) === 'dirty');

export const useIsFormDirty = (formId: FormId): boolean =>
  useFormStore((state) => formStatus(state.forms[formId]) === 'dirty');

export const useIsFieldDirty = (
  formId: FormId,
  address: FieldAddress
): boolean => useFormStore((state) => fieldDirty(state.forms[formId], address));

export const useFormValues = (formId: FormId): TinaDocument | undefined => {
  const values = useFormStore((state) => state.forms[formId]?.values);
  return useMemo(() => (values ? toDocument(values) : undefined), [values]);
};

const NO_FIELD_ERRORS: FieldErrors = {};

export const useFormErrors = (formId: FormId): FieldErrors =>
  useFormStore((state) => {
    const scope = state.forms[formId];
    return isEdited(scope) ? scope.errors : NO_FIELD_ERRORS;
  });

export const useSaveSummary = (): SaveSummary =>
  useFormStore(useShallow(summarizeSaves));

export const useSaveAllFailureCount = (): number =>
  useFormStore((state) => failedIds(state).length);

export const useAnyFormDirty = (): boolean => useFormStore(anyFormDirty);

export const useSaveAllState = (): SaveAllState =>
  useFormStore((state) => state.saveAll);

export const useAnySaveRunning = (): boolean =>
  useFormStore(
    (state) =>
      state.saveAll.running !== null ||
      Object.keys(state.savePending).length > 0 ||
      Object.values(state.saves).some((save) => save?.phase === 'saving')
  );

/**
 * The documents with unsaved edits: the open forms that are dirty, and the
 * documents whose edits wait in a stored draft after a reload. The selector reads
 * storage on each store change, so a draft written or removed shows at once.
 */
export const useUnsavedFormIds = (): FormId[] =>
  useFormStore(
    useShallow((state) => {
      const dirty = (Object.keys(state.forms) as FormId[]).filter(
        (id) => formStatus(state.forms[id]) === 'dirty'
      );
      const stored = listStoredDraftIds(state.userId, state.branch);
      return [...new Set([...dirty, ...stored])];
    })
  );
