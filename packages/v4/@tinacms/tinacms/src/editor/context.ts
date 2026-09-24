import { createContext } from 'react';
import type { StoreApi } from 'zustand';
import type { TinaSchema } from '../config';
import type { FieldAddress } from '../core/field/address';
import type { ValidatorRegistry } from '../core/field/contract';
import type { FieldRegistry } from '../core/field/registry';
import type {
  FormHookRegistry,
  FormHookScope,
  FormHooks,
} from '../core/form/hooks';
import type { TinaStoreState } from '../core/plugin';
import type { FieldSchema, TinaDocument } from '../core/schema/types';
import type { ScreenRegistry } from '../core/screen/registry';

export type SaveHandler = (document: TinaDocument) => void | Promise<void>;

export interface TinaRuntime {
  registry: FieldRegistry;
  validators: ValidatorRegistry;
  hooks: FormHookRegistry;
  store: StoreApi<TinaStoreState>;
  schema: TinaSchema;
  screens: ScreenRegistry;
}
export const TinaRuntimeContext = createContext<TinaRuntime | null>(null);

export interface FormScope extends FormHookScope {
  onSave: SaveHandler | null;
  seedKey: string;
  discardEdits: () => void;
  hooks: readonly FormHooks[];
}
export const FormScopeContext = createContext<FormScope | null>(null);

export const FieldAddressContext = createContext<FieldAddress | null>(null);

export const FieldSchemaContext = createContext<FieldSchema | null>(null);
