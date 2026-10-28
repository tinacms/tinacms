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
import type { FormViewStore } from './form-view-state';
import type { ScreenRegistry } from '../core/screen/registry';
import type { GlobalNavSection } from '../core/slot/contract';

export interface SavedDocument {
  document: TinaDocument;
  hookWarnings?: string[];
}

export type SaveHandler = (
  document: TinaDocument
) => void | SavedDocument | Promise<void | SavedDocument>;

export interface TinaRuntime {
  registry: FieldRegistry;
  validators: ValidatorRegistry;
  hooks: FormHookRegistry;
  serverHooks: ReadonlySet<string>;
  rpcUrl: string;
  store: StoreApi<TinaStoreState>;
  schema: TinaSchema;
  screens: ScreenRegistry;
  globalNav: GlobalNavSection[];
}
export const TinaRuntimeContext = createContext<TinaRuntime | null>(null);

export interface FormScope extends FormHookScope {
  onSave: SaveHandler | null;
  seedKey: string;
  // Changes with `seedKey`, and also when a save writes values back, so an
  // uncontrolled widget redraws without a remount of the whole form.
  fieldSeedKey: string;
  reseedFields: () => void;
  // Lives above the form fields, so a remount of the fields keeps it.
  saveFailure: string | null;
  setSaveFailure: (message: string | null) => void;
  view: FormViewStore;
  discardEdits: () => void;
  hooks: readonly FormHooks[];
  staleDraft: StaleDraftActions | null;
}

export interface StaleDraftActions {
  resume: () => void;
  discard: () => void;
}
export const FormScopeContext = createContext<FormScope | null>(null);

export const FieldAddressContext = createContext<FieldAddress | null>(null);

export const FieldSchemaContext = createContext<FieldSchema | null>(null);
