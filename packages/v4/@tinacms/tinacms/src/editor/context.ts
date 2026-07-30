import { createContext } from 'react';
import type { StoreApi } from 'zustand';
import type { TinaSchema } from '../config';
import type { FieldAddress } from '../core/field/address';
import type { FieldRegistry } from '../core/field/registry';
import type { TinaStoreState } from '../core/plugin';
import type {
  CollectionSchema,
  FieldSchema,
  TinaDocument,
} from '../core/schema/types';
import type { ScreenRegistry } from '../core/screen/registry';
import type { FormId } from '../form/form-store';

export type SaveHandler = (document: TinaDocument) => void | Promise<void>;

export interface TinaRuntime {
  registry: FieldRegistry;
  store: StoreApi<TinaStoreState>;
  schema: TinaSchema;
  screens: ScreenRegistry;
}
export const TinaRuntimeContext = createContext<TinaRuntime | null>(null);

export interface FormScope {
  formId: FormId;
  path: string;
  collection: CollectionSchema;
  onSave: SaveHandler | null;
  seedKey: string;
  discardEdits: () => void;
}
export const FormScopeContext = createContext<FormScope | null>(null);

export const FieldAddressContext = createContext<FieldAddress | null>(null);

export const FieldSchemaContext = createContext<FieldSchema | null>(null);
