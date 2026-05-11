/**
 * @tinacms/bridge — vanilla JS bridge between the TinaCMS admin iframe and
 * a non-React frontend.
 *
 * **Astro consumers should import from `@tinacms/astro/bridge` instead** —
 * this package is the framework-agnostic core, re-exported by `@tinacms/astro`
 * so Astro projects only install one TinaCMS package. Direct consumption of
 * `@tinacms/bridge` is intended for Hugo, plain-HTML, Eleventy, and any other
 * non-Astro / non-React frontend.
 *
 * Mirrors the postMessage protocol used by the React `useTina` hook in
 * tinacms/react, but writes to the DOM by re-fetching opt-in server islands
 * (`[data-tina-island]`) instead of reconciling React state. Stateless: the
 * admin pushes already-resolved data via postMessage, and the bridge forwards
 * it on island refetches via the `X-Tina-Preview` header. The canonical
 * content store is never touched in edit mode.
 */
import { initClickToFocus } from './click-to-focus';
import { setAdminOrigin } from './config';
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
  /**
   * Origin(s) of the TinaCMS admin parent. Inbound postMessage events are
   * accepted only when `event.origin` matches one of these AND
   * `event.source` is `window.parent`. Outbound posts use the first entry
   * (or the single string) as `targetOrigin`.
   *
   * Defaults to `window.location.origin` — correct when the admin is
   * mounted at `/admin` on the same host (the common case). Override when
   * the admin runs on a different origin (cross-domain self-hosted
   * deployments, Codespaces, Docker setups). Mirrors the role of
   * `server.allowedOrigins` in `tina.config` for the dev server's CORS,
   * but applied to the in-iframe postMessage channel instead of HTTP.
   */
  adminOrigin?: string | string[];
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

  const { debounceMs = 300, adminOrigin = window.location.origin } = options;
  setAdminOrigin(adminOrigin);

  const store = initDataStore();
  initIslandRefresh(store, { debounceMs });
  initClickToFocus();
  // Forms register last so listeners are wired up before we announce
  // ourselves to the admin and start receiving updateData replies.
  initForms(store);
}

/**
 * Re-scan the page for `[data-tina-form]` payloads after a soft
 * navigation (Astro view transitions, Turbo, htmx, etc.). Posts `close`
 * for forms that left and `open` for forms that appeared. Safe to call
 * before `init()` — no-op when the bridge isn't running.
 *
 * Astro projects using `@tinacms/astro/integration` get this wired
 * automatically (the middleware splices the bootstrap script that
 * listens for `astro:page-load`). Sites consuming `@tinacms/bridge`
 * directly need:
 *
 * ```ts
 * import { init, refreshForms } from '@tinacms/bridge';
 * init();
 * document.addEventListener('astro:page-load', refreshForms);
 * ```
 */
export { refreshForms };

export { tinaField } from './tina-field';
export type * from './types';
