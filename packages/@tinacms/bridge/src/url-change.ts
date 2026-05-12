/**
 * Posts `{type:'url-changed'}` to the admin parent when an SPA router
 * mutates history without unloading the page (Astro `<ClientRouter />`,
 * Turbo, htmx, etc.). Mirrors what `useTina` posts when its id changes.
 * Hard navs don't need this — `beforeunload` + new-page bootstrap cover
 * them. Idempotent across double-init; same-URL replaceState is skipped.
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

  const { history } = window;
  const push = history.pushState.bind(history);
  const replace = history.replaceState.bind(history);

  history.pushState = (...args: Parameters<History['pushState']>) => {
    push(...args);
    maybeEmit();
  };
  history.replaceState = (...args: Parameters<History['replaceState']>) => {
    replace(...args);
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
  return `${location.pathname}${location.search}${location.hash}`;
}
