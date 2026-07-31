import { use, useCallback, useEffect, useRef } from 'react';
import { useController, useFormContext, useFormState } from 'react-hook-form';
import { useStore } from 'zustand';
import type { ContentSlice } from '../core/content/contract';
import type { FieldAddress } from '../core/field/address';
import type { FieldRegistry } from '../core/field/registry';
import { digestDocument } from '../core/form/ingest';
import { invariant } from '../core/invariant';
import type { TinaStoreState } from '../core/plugin';
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

// The `content` namespace has the open SliceState type, until codegen produces the
// typed capability reads. The one cast is here.
export function useContentSlice(): ContentSlice {
  const slice = useTinaStore((state) => state.content);
  invariant(
    slice,
    'content-capability-missing',
    'No content capability is mounted — pass a content plugin (e.g. localContentPlugin()) to <TinaProvider plugins>'
  );
  return slice as unknown as ContentSlice;
}

function useFormScope(hookCode: string, hookName: string): FormScope {
  const scope = use(FormScopeContext);
  invariant(scope, hookCode, `${hookName} must be used within a FormProvider`);
  return scope;
}

export function useFormId(): FormId {
  return useFormScope('form-id-outside-provider', 'useFormId').formId;
}

// The path of the open document. A field whose behaviour depends on the storage format
// builds its FieldTransformContext from this, so it resolves the same codec that the
// ingest and the save resolve.
export function useDocumentPath(): string {
  return useFormScope('document-path-outside-provider', 'useDocumentPath').path;
}

// The identity of the values the form was seeded from. A field whose editor owns its own
// state keys on this, so that a reseed mounts it again on the new values.
export function useFormSeedKey(): string {
  return useFormScope('form-seed-key-outside-provider', 'useFormSeedKey')
    .seedKey;
}

export interface ActiveField {
  active: FieldAddress | null;
  setActive: (address: FieldAddress | null) => void;
}

// The view of this form on the one active field in the store (ADR-009, visual editing).
// The `active` value is the address that a click in the preview activated. It is null
// when the active field belongs to another form. The `setActive` function sets that
// address, or clears it.
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
  return { active, setActive };
}

// Build the document again from the values of the form, and give it to the save handler
// of the host (ADR-018 and ADR-019). Only a save that resolves moves the baseline and
// makes the form clean. A save that rejects leaves the form dirty. The baseline is the
// snapshot from before the save, and not the latest values in the store. An edit made
// during the save therefore stays dirty.
export function useFormSave(): () => Promise<void> {
  const registry = useFieldRegistry();
  const scope = useFormScope('form-save-outside-provider', 'useFormSave');
  const { getValues } = useFormContext<TinaDocument>();
  return useCallback(async () => {
    const { formId, path, collection, onSave } = scope;
    const values = getValues();
    // The same context that the ingest parsed with, so one codec reads and writes
    // the value. Without it, a value read as .md could be written as .mdx.
    const digested = digestDocument(values, collection.fields, registry, {
      documentPath: path,
    });
    await onSave?.(digested);
    useFormStore.getState().markSaved(formId, toFormValues(values));
  }, [registry, scope, getValues]);
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

// The resolved schema node of the field, which holds its config. The caller asserts `T`.
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
  // The `errors` value of RHF has a complex mapped type. Cast it once, and index it by
  // field name. This assumes flat addresses, because there are no nested fields yet. A
  // nested path would need a path walk here.
  const fieldErrors = errors as Record<string, FieldErrorEntry | undefined>;
  return fieldErrorMessages(fieldErrors[address]);
}

export function useFieldActivation(handler: () => void): void {
  const address = use(FieldAddressContext);
  const formId = use(FormScopeContext)?.formId ?? null;
  // Subscribe to the activation entry, and not to a boolean. setActive writes a new
  // object at each call, so a second activation of the same field calls the handler
  // again. A boolean would hold its value, and the second click would do nothing.
  const active = useFormStore((state) => state.active);
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  useEffect(() => {
    if (
      address != null &&
      active?.formId === formId &&
      active.address === address
    ) {
      handlerRef.current();
    }
  }, [active, formId, address]);
}
