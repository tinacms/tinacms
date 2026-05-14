import { AsyncLocalStorage } from 'node:async_hooks';
import { escapeAttr } from './escape';

export interface CollectedForm {
  id: string;
  query: string;
  variables: object;
  data: object;
  priority?: 'primary';
}

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
  if (!list) return;
  // Same id can appear twice (layout + page both fetch the global). Dedup
  // and upgrade to `primary` if a later call asserts it.
  const existing = list.find((entry) => entry.id === form.id);
  if (existing) {
    if (form.priority === 'primary') existing.priority = 'primary';
    return;
  }
  list.push(form);
}

export function sortByPriority(forms: CollectedForm[]): CollectedForm[] {
  return [...forms].sort((a, b) => {
    const ap = a.priority === 'primary' ? 0 : 1;
    const bp = b.priority === 'primary' ? 0 : 1;
    return ap - bp;
  });
}

export function renderFormPayloadDiv(
  form: CollectedForm,
  primary: boolean
): string {
  return `<div data-tina-form="${escapeAttr(JSON.stringify(form))}"${
    primary ? ' data-tina-primary' : ''
  } hidden></div>`;
}
