import {
  use,
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
} from 'react';
import {
  get,
  useController,
  useFormContext,
  useFormState,
} from 'react-hook-form';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { FieldWrapperProps } from '@tinacms/ui/components/field-wrapper';
import type { AuthSlice } from '../core/auth/contract';
import { authSliceOf, siteAuthTokenOf } from '../core/auth/slice';
import { ContentError, type ContentSlice } from '../core/content/contract';
import type { MediaSlice } from '../core/media/contract';
import { type FieldAddress, toFieldAddress } from '../core/field/address';
import type { FieldRegistry } from '../core/field/registry';
import { runAfterSave, runBeforeSave } from '../core/form/hooks';
import { digestDocument, ingestDocument } from '../core/form/ingest';
import { invariant } from '../core/invariant';
import type { SliceState, TinaStoreState } from '../core/plugin';
import {
  type CollectionSchema,
  type FieldSchema,
  type TinaDocument,
  hasValidator,
} from '../core/schema/types';
import {
  type FormId,
  type FormValues,
  toFormValues,
  useFormErrors,
  useFormStore,
} from '../form/form-store';
import {
  type RpcClientConfig,
  type RpcProxy,
  createRpcClient,
} from '../rpc/proxy';
import {
  FieldActiveContext,
  FieldAddressContext,
  FieldLockContext,
  FieldSchemaContext,
  type FormScope,
  FormScopeContext,
  type SaveHandler,
  type StaleDraftActions,
  TinaRuntimeContext,
} from './context';
import {
  collectFieldErrorMessages,
  type ListChange,
  ownFieldErrors,
} from './field-errors';
import { UploadFormContext } from './uploads/upload-context';
import { uploadListOf } from './uploads/upload-list';
import { countRevealedErrors, isRevealed, itemLevel } from './form-view-state';

export function useFieldRegistry(): FieldRegistry {
  const runtime = use(TinaRuntimeContext);
  invariant(
    runtime,
    'field-registry-outside-provider',
    'useFieldRegistry must be used within a TinaProvider'
  );
  return runtime.registry;
}

export function useTinaStore<Selected>(
  selector: (state: TinaStoreState) => Selected
): Selected {
  const runtime = use(TinaRuntimeContext);
  invariant(
    runtime,
    'tina-store-outside-provider',
    'useTinaStore must be used within a TinaProvider'
  );
  return useStore(runtime.store, selector);
}

const isContentSlice = (
  slice: SliceState
): slice is SliceState & ContentSlice =>
  typeof slice.get === 'function' &&
  typeof slice.list === 'function' &&
  typeof slice.update === 'function';

export function useOptionalContentSlice(): ContentSlice | null {
  const slice = useTinaStore((state) => state.content);
  return slice && isContentSlice(slice) ? slice : null;
}

export function useContentSlice(): ContentSlice {
  const slice = useOptionalContentSlice();
  invariant(
    slice,
    'content-capability-missing',
    'No content capability with get, list and update is mounted — pass a content plugin (e.g. localContentPlugin()) to <TinaProvider plugins>'
  );
  return slice;
}

const isMediaSlice = (slice: SliceState): slice is SliceState & MediaSlice =>
  typeof slice.upload === 'function' &&
  typeof slice.list === 'function' &&
  typeof slice.delete === 'function' &&
  typeof slice.resolveUrl === 'function';

export function useMediaSlice(): MediaSlice {
  const slice = useTinaStore((state) => state.media);
  invariant(
    slice && isMediaSlice(slice),
    'media-capability-missing',
    'No media capability with upload, list, delete and resolveUrl is mounted — pass a media plugin (e.g. localMediaPlugin()) to <TinaProvider plugins>'
  );
  return slice;
}

export function useOptionalAuthSlice(): AuthSlice | null {
  return useTinaStore(authSliceOf);
}

export function useRpcClient<TSegments>(
  config: Omit<RpcClientConfig, 'getToken'>
): RpcProxy<TSegments> {
  const runtime = use(TinaRuntimeContext);
  invariant(
    runtime,
    'rpc-client-outside-provider',
    'useRpcClient must be used within a TinaProvider'
  );
  const { store } = runtime;
  const { url, fetch: fetchImpl } = config;
  const fetchRef = useRef(fetchImpl);
  useEffect(() => {
    fetchRef.current = fetchImpl;
  });
  return useMemo(
    () =>
      createRpcClient<TSegments>({
        url,
        fetch: (input, init) => (fetchRef.current ?? fetch)(input, init),
        getToken: () => siteAuthTokenOf(store.getState()),
      }),
    [store, url]
  );
}

function useFormScope(hookCode: string, hookName: string): FormScope {
  const scope = use(FormScopeContext);
  invariant(scope, hookCode, `${hookName} must be used within a FormProvider`);
  return scope;
}

export function useFormId(): FormId {
  return useFormScope('form-id-outside-provider', 'useFormId').formId;
}

export function useFormCollection(): CollectionSchema {
  return useFormScope('form-collection-outside-provider', 'useFormCollection')
    .collection;
}

export function useSchemaCollections(): CollectionSchema[] {
  const runtime = use(TinaRuntimeContext);
  invariant(
    runtime,
    'schema-collections-outside-provider',
    'useSchemaCollections must be used within a TinaProvider'
  );
  return runtime.schema.collections;
}

export function useDocumentPath(): string {
  return useFormScope('document-path-outside-provider', 'useDocumentPath').path;
}

export function useFormSeedKey(): string {
  return useFormScope('form-seed-key-outside-provider', 'useFormSeedKey')
    .fieldSeedKey;
}

export function useSaveFailure(): [
  string | null,
  (message: string | null) => void,
] {
  const { saveFailure, setSaveFailure } = useFormScope(
    'save-failure-outside-provider',
    'useSaveFailure'
  );
  return [saveFailure, setSaveFailure];
}

export function useDiscardEdits(): () => void {
  return useFormScope('discard-edits-outside-provider', 'useDiscardEdits')
    .discardEdits;
}

// Set while a stored copy waits for the editor to Resume or Discard it.
export function useStaleDraft(): StaleDraftActions | null {
  return useFormScope('stale-draft-outside-provider', 'useStaleDraft')
    .staleDraft;
}

/** The current activation. Each `setActive` call makes a new one, even for the same address. */
export function useActivation() {
  const formId = useFormId();
  return useFormStore((state) =>
    state.active?.formId === formId ? state.active : null
  );
}

export interface ActiveField {
  active: FieldAddress | null;
  setActive: (address: FieldAddress | null) => void;
}

export function useActiveField(): ActiveField {
  const formId = useFormId();
  const active = useFormStore((state) =>
    state.active?.formId === formId ? state.active.address : null
  );
  const setActive = useCallback(
    (address: FieldAddress | null) =>
      useFormStore.getState().setActive(formId, address),
    [formId]
  );
  return useMemo(() => ({ active, setActive }), [active, setActive]);
}

/** True while this field is the one the form shows as active, whether or not it has DOM focus. */
export function useFieldActive(): boolean {
  return use(FieldActiveContext);
}

// Save refused because the document has validation errors. The form stays
// dirty and every field keeps its messages (ADR-018 §2).
export class FormValidationError extends Error {
  constructor() {
    super('The document has validation errors. Fix them, then save again.');
    this.name = 'FormValidationError';
  }
}

export class AfterSaveHookError extends Error {
  constructor(cause: unknown) {
    super('The document was saved, but an afterSave hook failed.', { cause });
    this.name = 'AfterSaveHookError';
  }
}

// The stored document becomes the baseline. A field the save changed takes the
// stored value, unless the editor changed it again while the save ran. Returns
// the fields it wrote, or null when the save changed nothing.
const adoptSavedValues = (
  formId: FormId,
  submitted: FormValues,
  saved: FormValues,
  setValue: (address: FieldAddress, value: unknown) => void
): FieldAddress[] | null => {
  const store = useFormStore.getState();
  const open = store.forms[formId];
  if (!open) return null;
  const changed = Object.keys(saved)
    .map(toFieldAddress)
    .filter(
      (address) => !open.equal(address, submitted[address], saved[address])
    );
  if (changed.length === 0) return null;
  const written = changed.filter((address) =>
    open.equal(address, open.values[address], submitted[address])
  );
  for (const address of written) {
    store.setFieldValue(formId, address, saved[address]);
    setValue(address, saved[address]);
  }
  store.markSaved(formId, saved);
  return written;
};

async function recordSavePhase(
  formId: FormId,
  run: () => Promise<void>
): Promise<void> {
  const { setSavePhase, restoreSavePhase, saves } = useFormStore.getState();
  const previous = saves[formId];
  setSavePhase(formId, { phase: 'saving' });
  try {
    await run();
  } catch (cause) {
    if (cause instanceof FormValidationError) {
      restoreSavePhase(formId, previous);
      throw cause;
    }
    let message = 'Save failed.';
    if (cause instanceof Error && cause.message) message = cause.message;
    if (cause instanceof ContentError && cause.code === 'branch-not-found') {
      setSavePhase(formId, { phase: 'failed', message, reason: 'branch-gone' });
    } else {
      setSavePhase(formId, { phase: 'failed', message });
    }
    throw cause;
  }
  setSavePhase(formId, { phase: 'saved' });
}

// Checks every field, not only the edited ones, so a required field the editor
// never touched surfaces its message at submit. Resolves false, and records the
// save as failed, when the form is invalid.
export function useFormCheck(): () => Promise<boolean> {
  const scope = useFormScope('form-check-outside-provider', 'useFormCheck');
  const { trigger } = useFormContext<TinaDocument>();
  return useCallback(async () => {
    scope.view.getState().attemptSave();
    const valid = await trigger();
    const store = useFormStore.getState();
    if (!valid) {
      store.setSavePhase(scope.formId, {
        phase: 'failed',
        message: new FormValidationError().message,
      });
    } else {
      const last = store.saves[scope.formId];
      if (last?.phase === 'failed' && last.reason !== 'branch-gone') {
        store.clearSavePhase(scope.formId);
      }
    }
    return valid;
  }, [scope, trigger]);
}

export interface SaveSteps {
  /** Writes the document after `beforeSave`. The form's `onSave` when absent. */
  write?: SaveHandler;
  /** Runs once the write resolves and the form is marked saved, before `afterSave`. */
  afterWrite?: () => void;
}

// The admin's Save to new branch swaps the write step. Not exported from `editor/index.ts`.
export function useFormSaveWith(): (steps?: SaveSteps) => Promise<void> {
  const registry = useFieldRegistry();
  const scope = useFormScope('form-save-outside-provider', 'useFormSave');
  const { getValues, setValue } = useFormContext<TinaDocument>();
  const check = useFormCheck();
  const runSave = useCallback(
    async ({ write, afterWrite }: SaveSteps) => {
      const { formId, path, collection, onSave, hooks, reseedFields } = scope;
      if (!(await check())) throw new FormValidationError();
      const values = getValues();
      const submitted = structuredClone(toFormValues(values));
      const context = { documentPath: path, registry };
      const hookScope = { formId, path, collection };
      const digested = await runBeforeSave(
        hooks,
        digestDocument(values, collection.fields, context),
        hookScope
      );
      const saved = await (write ?? onSave)?.(digested);
      const savedDocument = saved ? saved.document : digested;
      const written = adoptSavedValues(
        formId,
        submitted,
        toFormValues(ingestDocument(savedDocument, collection.fields, context)),
        (address, value) => setValue(address, value)
      );
      if (!written) useFormStore.getState().markSaved(formId, submitted);
      if (written && written.length > 0) reseedFields();
      afterWrite?.();
      try {
        await runAfterSave(hooks, savedDocument, hookScope);
      } catch (cause) {
        throw new AfterSaveHookError(cause);
      }
      scope.view.getState().resetReveal();
      const warnings = saved ? (saved.hookWarnings ?? []) : [];
      if (warnings.length > 0) {
        throw new AfterSaveHookError(new Error(warnings.join(' ')));
      }
    },
    [scope, check, getValues, setValue, registry]
  );
  return useCallback(
    (steps = {}) => recordSavePhase(scope.formId, () => runSave(steps)),
    [scope.formId, runSave]
  );
}

export function useFormSave(): () => Promise<void> {
  const saveWith = useFormSaveWith();
  return useCallback(() => saveWith(), [saveWith]);
}

export function useFieldAddress(): FieldAddress {
  const address = use(FieldAddressContext);
  invariant(
    address != null,
    'field-address-outside-field',
    'useFieldAddress must be used within a <Field>'
  );
  return address;
}

export function useFieldSchema<T extends FieldSchema = FieldSchema>(): T {
  const node = use(FieldSchemaContext);
  if (node == null) {
    throw new Error('useFieldSchema must be used within a <Field>');
  }
  return node as T;
}

export function useFieldValue<T = unknown>(
  address: FieldAddress
): [T, (value: T) => void] {
  const { field } = useController({ name: address });
  return [field.value as T, field.onChange as (value: T) => void];
}

export function useFieldErrors(address: FieldAddress): string[] {
  const { errors } = useFormState({ name: address });
  // `address` can nest through an index (`items.0.title`). `get` reads that
  // path the same way react-hook-form does. `collectFieldErrorMessages` also
  // walks down from it, so a compound field's address reports everything
  // wrong underneath it, not only a message at that exact address.
  return collectFieldErrorMessages(get(errors, address));
}

export interface FieldFrameOptions {
  /** Show only errors on the field's own address, not those of fields under it. */
  ownErrorsOnly?: boolean;
  /** Amber messages that do not block Save, such as a reference to a document that is gone. */
  warnings?: readonly string[];
}

export function useFieldFrame({
  ownErrorsOnly = false,
  warnings,
}: FieldFrameOptions = {}): Pick<
  FieldWrapperProps,
  'label' | 'htmlFor' | 'labelId' | 'required' | 'errors' | 'help' | 'helpId'
> & {
  warnings: string[];
  disabled: boolean;
  readOnly: boolean;
  active: boolean;
} {
  const address = useFieldAddress();
  const node = useFieldSchema();
  const { view } = useFormScope(
    'field-frame-outside-provider',
    'useFieldFrame'
  );
  const lock = use(FieldLockContext);
  const active = useFieldActive();
  const labelable =
    useFieldRegistry().get(node.type)?.metadata?.labelable !== false;
  const { errors } = useFormState({ name: address });
  const own = ownFieldErrors(get(errors, address), address);
  const keys = Object.keys(own).filter(
    (key) => !ownErrorsOnly || key === address
  );
  const revealed = useStore(
    view,
    useShallow((state) => keys.filter((key) => isRevealed(state, key)))
  );
  const shown = new Set<string>();
  for (const key of revealed)
    for (const message of own[key] ?? []) shown.add(message);
  return {
    label: node.label ?? node.name,
    htmlFor: labelable ? address : undefined,
    labelId: `${address}-label`,
    required: hasValidator(node, 'required'),
    errors: [...shown],
    warnings: [...(warnings ?? [])],
    help: node.description,
    helpId: node.description ? `${address}-help` : undefined,
    disabled: lock.disabled,
    readOnly: lock.readOnly,
    active,
  };
}

/** Opens the current field as the next form level. For a field that draws its own drill-in card. */
export function useOpenLevel(): () => void {
  const address = useFieldAddress();
  const node = useFieldSchema();
  const { view } = useFormScope('open-level-outside-provider', 'useOpenLevel');
  return () =>
    view.getState().openLevel({
      address,
      label: node.label ?? node.name,
      node,
    });
}

/** How many fields under the current field show an error. Counts fields, not messages. */
export function useInvalidFieldCount(): number {
  return useInvalidFieldCounts([useFieldAddress()])[0] ?? 0;
}

/** How many fields under each address show an error, in the same order. */
export function useInvalidFieldCounts(addresses: readonly string[]): number[] {
  const { view, formId } = useFormScope(
    'invalid-field-count-outside-provider',
    'useInvalidFieldCounts'
  );
  const errorAddresses = Object.keys(useFormErrors(formId));
  return useStore(
    view,
    useShallow((state) =>
      addresses.map((address) =>
        countRevealedErrors(state, errorAddresses, address)
      )
    )
  );
}

/**
 * Opens, reveals and touches the items of a list field by their address.
 * `insert`, `move` and `remove` re-key the error summary, then run `apply`
 * (the actual list change); a list field uses them for every such change.
 */
export function useListItems() {
  const { view } = useFormScope('list-items-outside-provider', 'useListItems');
  const runtime = use(TinaRuntimeContext);
  const uploadForm = use(UploadFormContext);
  const rekeyThen = (
    listAddress: string,
    change: ListChange,
    apply: () => void
  ) => {
    view.getState().rekey(listAddress, change);
    if (runtime && uploadForm) {
      uploadListOf(runtime.store).rekeyFields(uploadForm, listAddress, change);
    }
    apply();
  };
  return {
    openLevel: (
      itemAddress: string,
      label: string,
      fields: readonly FieldSchema[],
      block = false
    ) =>
      view.getState().openLevel(itemLevel(itemAddress, label, fields, block)),
    isRevealed: (itemAddress: string) =>
      isRevealed(view.getState(), itemAddress),
    touch: (itemAddress: FieldAddress) => view.getState().touch(itemAddress),
    insert: (listAddress: string, index: number, apply: () => void) =>
      rekeyThen(listAddress, { insert: index }, apply),
    move: (listAddress: string, from: number, to: number, apply: () => void) =>
      rekeyThen(listAddress, { move: [from, to] }, apply),
    remove: (listAddress: string, index: number, apply: () => void) =>
      rekeyThen(listAddress, { remove: index }, apply),
    /** The index of the item of `listAddress` the editor just came back from, once. */
    takeReturnedIndex: (listAddress: string): number | undefined => {
      const { returnedFrom, clearReturn } = view.getState();
      const prefix = `${listAddress}.`;
      if (!returnedFrom?.startsWith(prefix)) return undefined;
      const index = Number(returnedFrom.slice(prefix.length));
      if (!Number.isInteger(index)) return undefined;
      clearReturn();
      return index;
    },
  };
}

/** Whether the current field is the open form level, so it shows its fields in place. */
export function useIsOpenLevel(): boolean {
  const address = useFieldAddress();
  const { view } = useFormScope(
    'is-open-level-outside-provider',
    'useIsOpenLevel'
  );
  return useStore(
    view,
    (state) => state.openLevels.at(-1)?.address === address
  );
}

/** The newest Expand all or Collapse all of the form. `version` 0 means none was asked. */
export function useExpansion() {
  const { view } = useFormScope('expansion-outside-provider', 'useExpansion');
  return useStore(view, (state) => state.expansion);
}

export function useFieldActivation(handler: () => void): void {
  const address = use(FieldAddressContext);
  const formId = use(FormScopeContext)?.formId ?? null;
  const active = useFormStore((state) => state.active);
  const onActivate = useEffectEvent(handler);
  useEffect(() => {
    if (
      address != null &&
      active?.formId === formId &&
      active.address === address
    ) {
      onActivate();
    }
  }, [active, formId, address]);
}
