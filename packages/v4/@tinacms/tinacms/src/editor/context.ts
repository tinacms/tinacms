import { createContext } from 'react';
import type { FieldAddress } from '../core/field/address';
import type { FieldRegistry } from '../core/field/registry';
import type { CollectionSchema } from '../core/schema/types';

export interface ActiveField {
  active: FieldAddress | null;
  setActive: (address: FieldAddress | null) => void;
}

// TODO(zustand): RegistryContext and ActiveFieldContext become reads off the global
// store (ADR-003) once it exists. CollectionContext is form-scoped (the open
// document's schema), and FieldAddressContext is intentionally plain React context —
// per ADR-009 the only thing a field receives is its address, passed down by <Field>.
export const RegistryContext = createContext<FieldRegistry | null>(null);
export const CollectionContext = createContext<CollectionSchema | null>(null);
export const FieldAddressContext = createContext<FieldAddress | null>(null);
export const ActiveFieldContext = createContext<ActiveField | null>(null);
