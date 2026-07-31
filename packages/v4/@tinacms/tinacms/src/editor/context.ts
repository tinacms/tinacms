import { createContext } from 'react';
import type { StoreApi } from 'zustand';
import type { TinaSchema } from '../config';
import type { FieldAddress } from '../core/field/address';
import type { FieldRegistry } from '../core/field/registry';
import type { PageRegistry } from '../core/page/registry';
import type { TinaStoreState } from '../core/plugin';
import type {
  CollectionSchema,
  FieldSchema,
  TinaDocument,
} from '../core/schema/types';
import type { FormId } from '../form/form-store';

// The point where the content capability joins the save flow (ADR-018 and ADR-019). The
// host gives FormProvider a handler that stores the digested document. A rejection
// leaves the form dirty, because useFormSave marks the form clean only after the handler
// resolves.
export type SaveHandler = (document: TinaDocument) => void | Promise<void>;

// There is one context for each scope in the tree: the app, the form, and the field.
// There is not one context for each value. Each scope has one provider and one lifetime.
// No context here holds state that changes often. RHF holds the values, and the form
// store holds the status and the active field. More contexts would therefore save no
// render.

// The app scope, from TinaProvider. It holds the runtime composed at boot, from one
// resolveClientSegments pass that feeds both halves. The registry stays out of the
// store. It is a fixed map of React components, which is config and not state. The
// devtools could also not serialize it.
export interface TinaRuntime {
  registry: FieldRegistry;
  store: StoreApi<TinaStoreState>;
  // The content model that the admin navigates. It is config, and not state. It comes
  // from the build (ADR-016), so it sits beside the registry and not in the store.
  schema: TinaSchema;
  // The screens the plugins add to the admin. A fixed map of components composed at
  // boot, so it sits here for the same reason the field registry does.
  pages: PageRegistry;
}
export const TinaRuntimeContext = createContext<TinaRuntime | null>(null);

// The form scope, from FormProvider. It holds the identity of the open document, its
// schema, and the save handler. It changes only when the document changes. The
// `collection` and the save handler probably become reads from the store, or from a
// capability, when the data layer arrives (ADR-019). This scope then holds the id alone.
export interface FormScope {
  formId: FormId;
  // The path of the open document, beside the form id derived from it. The save needs
  // the path to build the transform context that the ingest used. Refer to
  // FieldTransformContext. A form id cannot give the path back.
  path: string;
  collection: CollectionSchema;
  onSave: SaveHandler | null;
  // The identity of the values the form was seeded from. A reseed changes it, so an
  // editor that owns its own state can mount again on the new values.
  seedKey: string;
}
export const FormScopeContext = createContext<FormScope | null>(null);

// The field scope. A field receives its address from <Field> (ADR-009). <Field> also
// passes the resolved schema node, which holds the config that the field renders from.
// The declarative validation stays on the validation path.
export const FieldAddressContext = createContext<FieldAddress | null>(null);
export const FieldSchemaContext = createContext<FieldSchema | null>(null);
