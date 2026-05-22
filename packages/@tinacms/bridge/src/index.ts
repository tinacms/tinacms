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
import {
  PRIMED_FORM_ATTR,
  initIslandRefresh,
  primeIslands,
} from './island-refresh';

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

// Only one prime pass runs at a time. A second `refreshForms()` arriving
// mid-prime (e.g. a soft navigation's `astro:page-load`) doesn't start a
// rival pass — it sets `reprimePending` so we run exactly one more pass once
// the in-flight one resolves. The in-flight pass reflects the pre-navigation
// DOM, so dropping the later call would strand the new page's forms.
let primingInFlight: Promise<void> | null = null;
let reprimePending = false;

/**
 * Re-scan for `[data-tina-form]` payloads after a soft navigation
 * (Astro view transitions, Turbo, htmx). On a prerendered page with no
 * server-injected payloads, prime from the island endpoints first.
 */
export function refreshForms(): void {
  // Forms a previous prime appended belong to a prior render; drop them
  // before re-scanning so a new page (or a re-prime after a mid-prime
  // navigation) never reads stale island payloads, and so the
  // server-forms check below sees only genuinely server-injected payloads.
  removePrimedForms();

  const hasServerForms = document.querySelector('[data-tina-form]');
  if (!hasServerForms && document.querySelector('[data-tina-island]')) {
    if (primingInFlight) {
      reprimePending = true;
      return;
    }
    debug('no server-injected forms; priming from island endpoints');
    primingInFlight = primeIslands().finally(() => {
      primingInFlight = null;
    });
    void primingInFlight.then(() => {
      // A navigation landed mid-prime: re-prime against the current DOM
      // rather than announcing this pass's now-stale payloads.
      if (reprimePending) {
        reprimePending = false;
        refreshForms();
        return;
      }
      refreshFormsFromDom();
    });
    return;
  }
  refreshFormsFromDom();
}

function removePrimedForms(): void {
  for (const el of document.querySelectorAll(`[${PRIMED_FORM_ATTR}]`)) {
    el.remove();
  }
}

export { tinaField } from './tina-field';
export type * from './types';
