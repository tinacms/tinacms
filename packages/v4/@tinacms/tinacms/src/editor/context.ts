import { createContext } from 'react';
import type { FieldAddress } from '../core/field/address';
import type { FieldRegistry } from '../core/field/registry';
import type { CollectionSchema, FieldSchema } from '../core/schema/types';

export interface ActiveField {
  active: FieldAddress | null;
  setActive: (address: FieldAddress | null) => void;
}

// TODO(zustand): RegistryContext and ActiveFieldContext become reads off the global
// store (ADR-003) once it exists. CollectionContext is form-scoped (the open
// document's schema). FieldAddressContext and FieldSchemaContext are intentionally
// plain React context. ADR-009 gives a field its address; we extend that so <Field>
// also passes the resolved schema node — the field's config for rendering (declarative
// validation stays on the validation path, schema(node)).
export const RegistryContext = createContext<FieldRegistry | null>(null);
export const CollectionContext = createContext<CollectionSchema | null>(null);
export const FieldAddressContext = createContext<FieldAddress | null>(null);
export const FieldSchemaContext = createContext<FieldSchema | null>(null);
export const ActiveFieldContext = createContext<ActiveField | null>(null);
