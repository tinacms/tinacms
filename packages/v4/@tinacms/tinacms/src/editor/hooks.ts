import { use, useCallback, useEffect, useEffectEvent, useMemo } from 'react';
import { useController, useFormContext, useFormState } from 'react-hook-form';
import { useStore } from 'zustand';
import type { ContentSlice } from '../core/content/contract';
import type { FieldAddress } from '../core/field/address';
import type { FieldRegistry } from '../core/field/registry';
import { digestDocument } from '../core/form/ingest';
import { invariant } from '../core/invariant';
import type { SliceState, TinaStoreState } from '../core/plugin';
import type { FieldSchema, TinaDocument } from '../core/schema/types';
import { type FormId, toFormValues, useFormStore } from '../form/form-store';
import {
  FieldAddressContext,
  FieldSchemaContext,
  type FormScope,
  FormScopeContext,
  TinaRuntimeContext,
} from './context';
import { type FieldErrorEntry, fieldErrorMessages } from './field-errors';

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

export function useContentSlice(): ContentSlice {
  const slice = useTinaStore((state) => state.content);
  invariant(
    slice && isContentSlice(slice),
    'content-capability-missing',
    'No content capability with get, list and update is mounted — pass a content plugin (e.g. localContentPlugin()) to <TinaProvider plugins>'
  );
  return slice;
}

function useFormScope(hookCode: string, hookName: string): FormScope {
  const scope = use(FormScopeContext);
  invariant(scope, hookCode, `${hookName} must be used within a FormProvider`);
  return scope;
}

export function useFormId(): FormId {
  return useFormScope('form-id-outside-provider', 'useFormId').formId;
}

export function useDocumentPath(): string {
  return useFormScope('document-path-outside-provider', 'useDocumentPath').path;
}

export function useFormSeedKey(): string {
  return useFormScope('form-seed-key-outside-provider', 'useFormSeedKey')
    .seedKey;
}

export function useDiscardEdits(): () => void {
  return useFormScope('discard-edits-outside-provider', 'useDiscardEdits')
    .discardEdits;
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

export function useFormSave(): () => Promise<void> {
  const registry = useFieldRegistry();
  const scope = useFormScope('form-save-outside-provider', 'useFormSave');
  const { getValues } = useFormContext<TinaDocument>();
  return useCallback(async () => {
    const { formId, path, collection, onSave } = scope;
    const values = getValues();
    const digested = digestDocument(values, collection.fields, registry, {
      documentPath: path,
    });
    await onSave?.(digested);
    useFormStore.getState().markSaved(formId, toFormValues(values));
  }, [scope, getValues, registry]);
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
  const fieldErrors = errors as Record<string, FieldErrorEntry | undefined>;
  return fieldErrorMessages(fieldErrors[address]);
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
