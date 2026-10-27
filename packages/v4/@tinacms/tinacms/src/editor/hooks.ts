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
import type { FieldWrapperProps } from '@tinacms/ui/components/field-wrapper';
import type { AuthSlice } from '../core/auth/contract';
import { authSliceOf, siteAuthTokenOf } from '../core/auth/slice';
import type { ContentSlice } from '../core/content/contract';
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
  useFormStore,
} from '../form/form-store';
import {
  type RpcClientConfig,
  type RpcProxy,
  createRpcClient,
} from '../rpc/proxy';
import {
  FieldAddressContext,
  FieldSchemaContext,
  type FormScope,
  FormScopeContext,
  type StaleDraftActions,
  TinaRuntimeContext,
} from './context';
import { collectFieldErrorMessages, ownFieldErrors } from './field-errors';
import { isRevealed } from './form-view-state';

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

// Set when the form opened on its document because a stored draft of an older
// version of it exists; the editor resumes the draft or discards it.
export function useStaleDraft(): StaleDraftActions | null {
  return useFormScope('stale-draft-outside-provider', 'useStaleDraft')
    .staleDraft;
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

export function useFormSave(): () => Promise<void> {
  const registry = useFieldRegistry();
  const scope = useFormScope('form-save-outside-provider', 'useFormSave');
  const { getValues, trigger, setValue } = useFormContext<TinaDocument>();
  return useCallback(async () => {
    const { formId, path, collection, onSave, hooks, reseedFields } = scope;
    // Validate every field, not only the edited ones, so a required field the
    // editor never touched surfaces its message at submit.
    scope.view.attemptSave();
    const valid = await trigger();
    if (!valid) throw new FormValidationError();
    const values = getValues();
    const submitted = structuredClone(toFormValues(values));
    const context = { documentPath: path, registry };
    const hookScope = { formId, path, collection };
    const digested = await runBeforeSave(
      hooks,
      digestDocument(values, collection.fields, context),
      hookScope
    );
    const saved = await onSave?.(digested);
    const savedDocument = saved ? saved.document : digested;
    const written = adoptSavedValues(
      formId,
      submitted,
      toFormValues(ingestDocument(savedDocument, collection.fields, context)),
      (address, value) => setValue(address, value)
    );
    if (!written) useFormStore.getState().markSaved(formId, submitted);
    if (written && written.length > 0) reseedFields();
    try {
      await runAfterSave(hooks, savedDocument, hookScope);
    } catch (cause) {
      throw new AfterSaveHookError(cause);
    }
    scope.view.resetReveal();
    const warnings = saved ? (saved.hookWarnings ?? []) : [];
    if (warnings.length > 0) {
      throw new AfterSaveHookError(new Error(warnings.join(' ')));
    }
  }, [scope, getValues, trigger, setValue, registry]);
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

export function useFieldFrame(): Pick<
  FieldWrapperProps,
  'label' | 'htmlFor' | 'labelId' | 'required' | 'errors'
> {
  const address = useFieldAddress();
  const node = useFieldSchema();
  const { view } = useFormScope(
    'field-frame-outside-provider',
    'useFieldFrame'
  );
  const labelable =
    useFieldRegistry().get(node.type)?.metadata?.labelable !== false;
  const { errors } = useFormState({ name: address });
  const shown = new Set<string>();
  for (const [key, messages] of Object.entries(
    ownFieldErrors(get(errors, address), address)
  )) {
    if (isRevealed(view, key))
      for (const message of messages) shown.add(message);
  }
  return {
    label: node.label ?? node.name,
    htmlFor: labelable ? address : undefined,
    labelId: `${address}-label`,
    required: hasValidator(node, 'required'),
    errors: [...shown],
  };
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
