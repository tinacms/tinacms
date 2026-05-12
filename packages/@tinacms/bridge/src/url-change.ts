/**
 * Mirrors what `useTina` posts on id change — lets the admin react to
 * SPA-router URL mutations the same way it reacts to React-side ones.
 */
import { getAdminOrigin } from './config';
import { debug } from './debug';
import type { BridgeOutgoing } from './types';

const URL_CHANGED: BridgeOutgoing = { type: 'url-changed' };

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
  window.parent.postMessage(URL_CHANGED, getAdminOrigin());
}

function currentUrl(): string {
  return `${location.pathname}${location.search}${location.hash}`;
}
