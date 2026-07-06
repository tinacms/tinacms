import { use, useEffect, useRef } from 'react';
import { useController, useFormState } from 'react-hook-form';
import type { FieldAddress } from '../core/field/address';
import type { FieldSchema } from '../core/schema/types';
import {
  ActiveFieldContext,
  FieldAddressContext,
  FieldSchemaContext,
} from './context';
import { type FieldErrorEntry, fieldErrorMessages } from './field-errors';

export function useFieldAddress(): FieldAddress {
  const address = use(FieldAddressContext);
  if (address == null) {
    throw new Error('useFieldAddress must be used within a <Field>');
  }
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
  const activeField = use(ActiveFieldContext);
  const active = activeField?.active ?? null;
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  useEffect(() => {
    if (address != null && active === address) handlerRef.current();
  }, [active, address]);
}
