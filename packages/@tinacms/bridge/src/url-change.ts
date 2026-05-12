/**
 * Emits `{type:'url-changed'}` to the admin parent on SPA history
 * navigation inside the iframe. Mirrors the message `useTina` posts when
 * its query/variables hash changes — the admin uses it as a hint that the
 * preview moved to a different route and the form registry may be about
 * to cycle via `close` / `open`.
 *
 * Three triggers:
 *
 *   1. `history.pushState`   — patched to call through, then post.
 *   2. `history.replaceState` — same.
 *   3. `popstate`             — fired by back/forward and pushState.
 *
 * Hard navigations (full page loads, plain `<a href>` without a SPA
 * router) don't need this — the bridge's existing `beforeunload` close
 * handler in `forms.ts` and the new-page bootstrap already cover them.
 * This module exists for SPA routers that mutate history without
 * unloading: Astro view transitions / ClientRouter, Turbo, htmx, etc.
 *
 * Idempotent: re-entry into `initUrlChange()` is a no-op so the same
 * `history.*` method is never wrapped twice across HMR / double-init.
 * Same-URL `replaceState` calls (common pattern for query-string updates)
 * are suppressed so the admin doesn't see chatter that isn't a real nav.
 */
import { getAdminOrigin } from './config';
import { debug } from './debug';

let initialized = false;
let lastEmittedUrl: string | null = null;

export function initUrlChange(): void {
  if (initialized) return;
  if (typeof window === 'undefined' || window.parent === window) return;
  initialized = true;

  lastEmittedUrl = currentUrl();

  const history = window.history;
  const originalPushState = history.pushState.bind(history);
  const originalReplaceState = history.replaceState.bind(history);

  history.pushState = function patchedPushState(
    ...args: Parameters<History['pushState']>
  ): void {
    originalPushState(...args);
    maybeEmit();
  };

  history.replaceState = function patchedReplaceState(
    ...args: Parameters<History['replaceState']>
  ): void {
    originalReplaceState(...args);
    maybeEmit();
  };

  window.addEventListener('popstate', maybeEmit);
}

function maybeEmit(): void {
  const url = currentUrl();
  if (url === lastEmittedUrl) return;
  lastEmittedUrl = url;
  debug('url-changed', url);
  window.parent.postMessage({ type: 'url-changed' }, getAdminOrigin());
}

function currentUrl(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}
