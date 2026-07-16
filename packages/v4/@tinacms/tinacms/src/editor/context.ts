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

// One context per tree scope — app, form, field — rather than one per value: each
// maps to exactly one provider and one lifetime. None carry hot-path mutable state
// (values live in RHF, status/active in the form store), so the usual
// split-contexts-to-limit-re-renders concern doesn't apply.

// App scope (TinaProvider): the boot-composed runtime, one resolveClientSegments
// pass feeding both halves. The registry deliberately stays out of the store — an
// immutable Map of React components is config, not state (and devtools couldn't
// serialize it).
export interface TinaRuntime {
  registry: FieldRegistry;
  store: StoreApi<TinaStoreState>;
}
export const TinaRuntimeContext = createContext<TinaRuntime | null>(null);

// Form scope (FormProvider): the open document's identity, schema and save seam —
// changes only on document switch. `collection` (and save) likely become store /
// capability reads once the data layer (ADR-019) lands, shrinking this to the id.
export interface FormScope {
  formId: FormId;
  collection: CollectionSchema;
  onSave: SaveHandler | null;
}
export const FormScopeContext = createContext<FormScope | null>(null);

// Field scope: per ADR-009 a field receives its address, passed down by <Field>;
// extended so <Field> also passes the resolved schema node — the field's config
// for rendering (declarative validation stays on the validation path).
export const FieldAddressContext = createContext<FieldAddress | null>(null);
export const FieldSchemaContext = createContext<FieldSchema | null>(null);
