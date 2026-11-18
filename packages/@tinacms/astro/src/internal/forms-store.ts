import { AsyncLocalStorage } from 'node:async_hooks';
import { type CollectedForm, addForm } from '@tinacms/bridge/form-payload';

export type { CollectedForm };

// Symbol slot on globalThis so bundle copies (esbuild inlines this module
// into each entry that imports it) share one ALS instance.
const STORE_KEY = Symbol.for('@tinacms/astro/forms-store');

type Slot = { [STORE_KEY]?: AsyncLocalStorage<CollectedForm[]> };
const slot = globalThis as unknown as Slot;

export const formsStore: AsyncLocalStorage<CollectedForm[]> = (slot[
  STORE_KEY
] ??= new AsyncLocalStorage<CollectedForm[]>());

export function recordForm(form: CollectedForm): void {
  const list = formsStore.getStore();
  if (list) addForm(list, form);
}
