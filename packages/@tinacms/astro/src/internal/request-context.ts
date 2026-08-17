/**
 * Request-scoped storage so `tina()` can read the current request without
 * the caller threading `Astro.request` through every loader. The
 * middleware injected by the `tina()` integration runs every request
 * through `requestStore.run(...)`.
 *
 * Falls through to `undefined` outside a request scope (static builds,
 * integration not installed) — `tina()` treats that as "no overlay,
 * no edit mode," so static contexts still produce correct output.
 *
 * Stashed on `globalThis` via `Symbol.for(...)` so all bundle copies of
 * this module share one ALS instance — esbuild inlines it into every
 * entry that imports it, and per-entry copies wouldn't share state.
 */
import { AsyncLocalStorage } from 'node:async_hooks';

const STORE_KEY = Symbol.for('@tinacms/astro/request-context');

type Slot = { [STORE_KEY]?: AsyncLocalStorage<Request> };
const slot = globalThis as unknown as Slot;

export const requestStore: AsyncLocalStorage<Request> = (slot[STORE_KEY] ??=
  new AsyncLocalStorage<Request>());
