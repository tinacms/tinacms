/**
 * Vanilla-JS bridge between the TinaCMS admin iframe and a non-React
 * frontend. Astro consumers should import from `@tinacms/astro` instead;
 * this package is the framework-agnostic core.
 */
import { initClickToFocus } from './click-to-focus';
import { setAdminOrigin } from './config';
import { initDataStore } from './data-store';
import { debug } from './debug';
import { initForms, refreshForms as refreshFormsFromDom } from './forms';
import { initIslandRefresh, primeIslands } from './island-refresh';

export interface BridgeOptions {
  /** Debounce for refetches after the first edit. The first refetch
   *  fires immediately. Default 300ms. */
  debounceMs?: number;
  /** Allowed origin(s) of the admin parent for in-iframe postMessage.
   *  Defaults to `window.location.origin` (same-host `/admin`). */
  adminOrigin?: string | string[];
}

let initialized = false;

export function init(options: BridgeOptions = {}): void {
  if (initialized) return;
  initialized = true;

  if (typeof window === 'undefined' || window.parent === window) {
    debug('not in an iframe; bridge is a no-op');
    return;
  }
  debug('initialising in iframe');

  const { debounceMs = 300, adminOrigin = window.location.origin } = options;
  setAdminOrigin(adminOrigin);

  const store = initDataStore();
  initIslandRefresh(store, { debounceMs });
  initClickToFocus();
  // Forms last: listeners wired before we start receiving updateData.
  initForms(store);

  refreshForms();
}

// Guards against overlapping prime passes: if `refreshForms()` fires again
// (a second `astro:page-load`) before the first prime resolves, both runs
// would append `[data-tina-form]` divs for the same islands. The in-flight
// run already reflects the current DOM, so later callers just await it.
let primingInFlight: Promise<void> | null = null;

/**
 * Re-scan for `[data-tina-form]` payloads after a soft navigation
 * (Astro view transitions, Turbo, htmx). On a prerendered page with no
 * server-injected payloads, prime from the island endpoints first.
 */
export function refreshForms(): void {
  const hasServerForms = document.querySelector('[data-tina-form]');
  if (!hasServerForms && document.querySelector('[data-tina-island]')) {
    if (primingInFlight) return;
    debug('no server-injected forms; priming from island endpoints');
    primingInFlight = primeIslands().finally(() => {
      primingInFlight = null;
    });
    void primingInFlight.then(refreshFormsFromDom);
    return;
  }
  refreshFormsFromDom();
}

export { tinaField } from './tina-field';
export type * from './types';
