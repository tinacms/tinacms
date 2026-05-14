/**
 * Per-request collector for `tina()` results. Each call pushes its
 * `{id, query, variables, data}` payload here so the integration's
 * middleware can read the full list at response time and splice the
 * bridge wiring into edit-mode pages — the user never writes a `forms`
 * prop or imports a wiring component.
 *
 * Initialised by the middleware the `tina()` integration injects.
 *
 * The store is keyed by a `Symbol.for(...)` slot on `globalThis` so all
 * bundle copies of this module (esbuild inlines it into each entry that
 * imports it) share the same instance — without that, the middleware
 * would `.run()` one ALS while `tina()` reads from a different one.
 */
import { AsyncLocalStorage } from 'node:async_hooks';

export interface CollectedForm {
  id: string;
  query: string;
  variables: object;
  data: object;
}

const STORE_KEY = Symbol.for('@tinacms/astro/forms-store');

type Slot = { [STORE_KEY]?: AsyncLocalStorage<CollectedForm[]> };
const slot = globalThis as unknown as Slot;

export const formsStore: AsyncLocalStorage<CollectedForm[]> = (slot[
  STORE_KEY
] ??= new AsyncLocalStorage<CollectedForm[]>());

export function recordForm(form: CollectedForm): void {
  const list = formsStore.getStore();
  if (!list) return;
  // Same id can appear multiple times (e.g., layout + page both fetch the
  // global). De-dup on id so the bridge doesn't see two open events for
  // the same form.
  if (list.some((existing) => existing.id === form.id)) return;
  list.push(form);
}
