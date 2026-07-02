import { createContext } from 'react';
import type { StoreApi } from 'zustand';
import type { FieldAddress } from '../core/field/address';
import type { FieldRegistry } from '../core/field/registry';
import type { TinaStoreState } from '../core/plugin';
import type {
  CollectionSchema,
  FieldSchema,
  TinaDocument,
} from '../core/schema/types';
import type { FormId } from '../form/form-store';

// The seam where the content capability (ADR-018/019 save flow) plugs in: the host
// hands FormProvider a handler that persists the digested document. A rejection
// leaves the form dirty (useFormSave only marks saved after it resolves).
export type SaveHandler = (document: TinaDocument) => void | Promise<void>;

// RegistryContext deliberately stays React context rather than moving into the boot
// store: the registry is an immutable Map of React components — configuration
// resolved once, not state (devtools can't serialize it either). CollectionContext,
// FormIdContext and SaveHandlerContext are form-scoped; FieldAddressContext and
// FieldSchemaContext are intentionally plain context — per ADR-009 a field receives
// its address (extended with its resolved schema node), passed down by <Field>.
export const RegistryContext = createContext<FieldRegistry | null>(null);
export const TinaStoreContext = createContext<StoreApi<TinaStoreState> | null>(
  null
);
export const CollectionContext = createContext<CollectionSchema | null>(null);
export const FormIdContext = createContext<FormId | null>(null);
export const SaveHandlerContext = createContext<SaveHandler | null>(null);
export const FieldAddressContext = createContext<FieldAddress | null>(null);
export const FieldSchemaContext = createContext<FieldSchema | null>(null);
