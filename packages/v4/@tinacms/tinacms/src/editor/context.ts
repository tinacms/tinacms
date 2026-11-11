import type { StoredDraft } from '../form/drafts';
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
import type { GlobalNavSection, HomePanels } from '../core/slot/contract';

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
  homePanels: HomePanels;
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

/** Why a draft waits: kept since the last visit, the file changed since, or a leftover of an earlier Resume. */
export type WaitingCause = 'kept' | 'changed' | 'leftover';

export interface StaleDraftActions {
  cause: WaitingCause;
  /** Labels of the fields held in the newest leftover copy. */
  leftoverFields: string[];
  /** The waiting copies the editor sees now. Discard removes the ones it was shown. */
  copies: readonly StoredDraft[];
  resume: () => void;
  /** Removes the given copies. The caller confirms first. */
  discard: (copies: readonly StoredDraft[]) => void;
}
export const FormScopeContext = createContext<FormScope | null>(null);

export const FieldAddressContext = createContext<FieldAddress | null>(null);

export const FieldSchemaContext = createContext<FieldSchema | null>(null);

/** Whether an enclosing field is disabled or read-only. The fields inside it are too. */
export interface FieldLock {
  readonly disabled: boolean;
  readonly readOnly: boolean;
}

export const FieldLockContext = createContext<FieldLock>({
  disabled: false,
  readOnly: false,
});
