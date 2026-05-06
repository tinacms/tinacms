/**
 * @tinacms/bridge — vanilla JS bridge between the TinaCMS admin iframe and
 * a non-React frontend (Astro, Hugo, plain HTML).
 *
 * Mirrors the postMessage protocol used by the React `useTina` hook in
 * tinacms/react, but writes to the DOM by re-fetching opt-in server islands
 * (`[data-tina-island]`) instead of reconciling React state. Stateless: the
 * admin pushes already-resolved data via postMessage, and the bridge forwards
 * it on island refetches via the `X-Tina-Preview` header. The canonical
 * content store is never touched in edit mode.
 */
import { initClickToFocus } from './click-to-focus';
import { initDataStore } from './data-store';
import { debug } from './debug';
import { initForms, refreshForms } from './forms';
import { initIslandRefresh } from './island-refresh';

export interface BridgeOptions {
  /**
   * Per-island debounce for refetches triggered by subsequent edits.
   * The first refetch after page load fires immediately so newly-created
   * docs reach a populated state ASAP. Default 300ms.
   */
  debounceMs?: number;
}

let initialized = false;

export function init(options: BridgeOptions = {}): void {
  if (initialized) return;
  initialized = true;

  // Outside an iframe (e.g. someone visiting /?tina-edit=1 directly) the
  // bridge has nobody to talk to — bail without side effects.
  if (typeof window === 'undefined' || window.parent === window) {
    debug('not in an iframe; bridge is a no-op');
    return;
  }
  debug('initialising in iframe');

  const { debounceMs = 300 } = options;

  const store = initDataStore();
  initIslandRefresh(store, { debounceMs });
  initClickToFocus();
  // Forms register last so listeners are wired up before we announce
  // ourselves to the admin and start receiving updateData replies.
  initForms(store);
}

/**
 * Re-scan the page for `<script type="application/tina+json">` form
 * payloads after a soft navigation (Astro view transitions, Turbo,
 * htmx, etc.). Posts `close` for forms that left and `open` for forms
 * that appeared. Safe to call before `init()` — no-op when the bridge
 * isn't running.
 *
 * Typical wiring on an Astro site that uses `<ClientRouter />`:
 *
 * ```ts
 * import { init, refreshForms } from '@tinacms/astro/bridge';
 * init();
 * document.addEventListener('astro:page-load', refreshForms);
 * ```
 */
export { refreshForms };

export { tinaField } from './tina-field';
export type * from './types';
