import { use, useCallback, useEffect, useRef } from 'react';
import { useController, useFormContext, useFormState } from 'react-hook-form';
import { useStore } from 'zustand';
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

function useFormScope(hookCode: string, hookName: string): FormScope {
  const scope = use(FormScopeContext);
  invariant(scope, hookCode, `${hookName} must be used within a FormProvider`);
  return scope;
}

export function useFormId(): FormId {
  return useFormScope('form-id-outside-provider', 'useFormId').formId;
}

export interface ActiveField {
  active: FieldAddress | null;
  setActive: (address: FieldAddress | null) => void;
}

// The current form's view of the store's single active field (ADR-009 visual
// editing): `active` is the address a preview click activated (null when the active
// field belongs to another form), `setActive` activates/clears it.
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

// Reconstruct the document from the form's values and hand it to the host's save
// handler (the ADR-018/019 seam); only a resolved save freezes the clean baseline —
// a rejected save leaves the form dirty. The baseline is the pre-save snapshot, not
// the store's latest values, so edits typed while the save is in flight stay dirty.
export function useFormSave(): () => Promise<void> {
  const registry = useFieldRegistry();
  const scope = useFormScope('form-save-outside-provider', 'useFormSave');
  const { getValues } = useFormContext<TinaDocument>();
  return useCallback(async () => {
    const { formId, collection, onSave } = scope;
    const values = getValues();
    const digested = digestDocument(values, collection.fields, registry);
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

// The field's own resolved schema node, for reading its config. `T` is
// caller-asserted.
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
  // RHF's `errors` is a complex mapped type; cast it once to index by field name.
  // Assumes flat addresses (no nested fields yet) — nested paths would need a path
  // walk here instead of a direct key access.
  const fieldErrors = errors as Record<string, FieldErrorEntry | undefined>;
  return fieldErrorMessages(fieldErrors[address]);
}

export function useFieldActivation(handler: () => void): void {
  const address = use(FieldAddressContext);
  const formId = use(FormScopeContext)?.formId ?? null;
  // Subscribe to the activation entry itself, not a derived boolean: setActive
  // writes a fresh object every call, so re-activating an already-active field
  // re-fires the handler (a boolean would latch and swallow the repeat click).
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
