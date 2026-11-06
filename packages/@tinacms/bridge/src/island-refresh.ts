import { isFromAdmin } from './config';
import { debug } from './debug';
import { FORM_SELECTOR, PRIMARY_FORM_ATTR, reportQuickEdit } from './forms';
import {
  PREVIEW_CONTENT_TYPE,
  PRIME_HEADER,
  type PreviewEnvelope,
} from './preview';
import type { DataStore } from './types';

export interface IslandRefreshOptions {
  debounceMs: number;
}

const ISLAND_SELECTOR = '[data-tina-island]';
const ENDPOINT_ATTR = 'data-tina-island';
const PRIMARY_ISLAND_ATTR = 'data-tina-island-primary';
const MANAGED_ISLAND_ATTR = 'data-tina-island-managed';
const FORMS_ATTR = 'data-tina-island-forms';
const FIRST_UPDATE_WINDOW_MS = 50;
/** The latest refresh started for each island; an older response is dropped. */
const latestRefresh = new WeakMap<HTMLElement, number>();
/** Marks a `[data-tina-form]` div that a prime pass appended (vs. one the
 *  server injected), so a later re-scan can drop it before re-priming. */
export const PRIMED_FORM_ATTR = 'data-tina-primed';

/**
 * Re-fetches the islands that use a form the admin changed, POSTing the
 * unsaved data as JSON (a header would cap it at ~8KB). The admin re-sends
 * every open form on each change, so an identical repeat is dropped. Edits
 * are debounced, and the burst of first updates the admin sends when it
 * opens becomes one pass. An island without `data-tina-island-forms` is
 * refreshed on every pass; a managed island never is, since swapping its
 * HTML would detach its framework's DOM nodes.
 */
export function initIslandRefresh(
  store: DataStore,
  options: IslandRefreshOptions
): void {
  let pendingRefresh: ReturnType<typeof setTimeout> | null = null;
  let pendingIsFirstUpdate = false;
  const changed = new Set<string>();

  const refreshChanged = () => {
    pendingRefresh = null;
    const ids = new Set(changed);
    changed.clear();
    const islands = document.querySelectorAll<HTMLElement>(ISLAND_SELECTOR);
    for (const island of islands) {
      if (island.hasAttribute(MANAGED_ISLAND_ATTR)) continue;
      if (!usesAnyForm(island, ids)) continue;
      void refreshIsland(island, store);
    }
  };

  store.subscribe(({ id, firstUpdate }) => {
    changed.add(id);
    // A pending first-update pass already includes this change; don't push
    // it back behind the debounce.
    if (pendingRefresh && pendingIsFirstUpdate) return;
    if (pendingRefresh) clearTimeout(pendingRefresh);
    pendingIsFirstUpdate = firstUpdate;
    pendingRefresh = setTimeout(
      refreshChanged,
      firstUpdate ? FIRST_UPDATE_WINDOW_MS : options.debounceMs
    );
  });

  const lastUpdates = new Map<string, string>();

  window.addEventListener('message', (event) => {
    if (!isFromAdmin(event)) return;
    const message = event.data;
    if (!message || typeof message !== 'object') return;

    if (message.type === 'updateData' && typeof message.id === 'string') {
      if (!store.has(message.id)) {
        debug('updateData for unknown id', message.id, '— ignoring');
        return;
      }
      const data = message.data ?? {};
      const serialized = JSON.stringify(data);
      if (lastUpdates.get(message.id) === serialized) {
        debug('updateData unchanged for', message.id);
        return;
      }
      lastUpdates.set(message.id, serialized);
      debug('updateData received for', message.id);
      store.set(message.id, data);
    }
  });
}

function usesAnyForm(island: HTMLElement, ids: ReadonlySet<string>): boolean {
  const forms = island.getAttribute(FORMS_ATTR);
  if (forms === null) return true;
  return forms.split(/\s+/).some((id) => ids.has(id));
}

async function refreshIsland(
  island: HTMLElement,
  store: DataStore
): Promise<void> {
  const endpoint = island.getAttribute(ENDPOINT_ATTR);
  if (!endpoint) return;

  const overlay: PreviewEnvelope = {};
  for (const id of store.ids()) {
    const data = store.get(id);
    if (data) overlay[id] = data;
  }
  const refresh = (latestRefresh.get(island) ?? 0) + 1;
  latestRefresh.set(island, refresh);

  try {
    debug('refreshing island', endpoint);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': PREVIEW_CONTENT_TYPE },
      body: JSON.stringify(overlay),
      cache: 'no-store',
      credentials: 'same-origin',
    });
    if (!response.ok) {
      debug('island refetch failed', endpoint, response.status);
      return;
    }
    if (!isHtmlResponse(response)) {
      debug('island refetch wrong content-type', endpoint);
      return;
    }
    const html = await response.text();
    if (latestRefresh.get(island) !== refresh) {
      debug('island refetch superseded', endpoint);
      return;
    }
    swapIslandHtml(island, html);
    reportQuickEdit();
  } catch (error) {
    debug('island refetch error', endpoint, error);
  }
}

/**
 * Hydrate `[data-tina-form]` payloads for prerendered pages by hitting
 * each island endpoint with the prime header set; the endpoint prepends
 * payloads to the region HTML. The caller follows up with refreshForms()
 * to announce them. Region HTML isn't swapped — canonical data is
 * already on the page; the first real `updateData` handles updates.
 */
export async function primeIslands(): Promise<void> {
  const islands = document.querySelectorAll<HTMLElement>(ISLAND_SELECTOR);
  const results = await Promise.all(Array.from(islands, primeIsland));
  for (const formEl of results.flat()) {
    formEl.setAttribute(PRIMED_FORM_ATTR, '');
    document.body.appendChild(formEl);
  }
}

async function primeIsland(island: HTMLElement): Promise<HTMLElement[]> {
  const endpoint = island.getAttribute(ENDPOINT_ATTR);
  if (!endpoint) return [];
  const isPrimary = island.hasAttribute(PRIMARY_ISLAND_ATTR);
  try {
    debug('priming island', endpoint);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': PREVIEW_CONTENT_TYPE,
        [PRIME_HEADER]: '1',
      },
      body: '{}',
      cache: 'no-store',
      credentials: 'same-origin',
    });
    if (!response.ok) {
      debug('island prime failed', endpoint, response.status);
      return [];
    }
    if (!isHtmlResponse(response)) {
      debug('island prime wrong content-type', endpoint);
      return [];
    }
    const template = document.createElement('template');
    template.innerHTML = (await response.text()).trim();
    const formEls = Array.from(
      template.content.querySelectorAll<HTMLElement>(FORM_SELECTOR)
    );
    if (isPrimary && formEls[0]) {
      formEls[0].setAttribute(PRIMARY_FORM_ATTR, '');
    }
    const forms = template.content
      .querySelector(ISLAND_SELECTOR)
      ?.getAttribute(FORMS_ATTR);
    if (forms) island.setAttribute(FORMS_ATTR, forms);
    return formEls;
  } catch (error) {
    debug('island prime error', endpoint, error);
    return [];
  }
}

function isHtmlResponse(response: Response): boolean {
  const contentType = response.headers.get('content-type') ?? '';
  return contentType.includes('text/html');
}

/**
 * Only attributes the island contract actually uses are carried over from
 * the server response. Anything else (event handlers, inline `style`, etc.)
 * is dropped — the bridge trusts the island endpoint's HTML body but not
 * its attribute surface. The endpoint stays the page's: it's the URL the
 * browser can reach, and the server's view of its own path can differ
 * behind a proxy.
 */
function isAllowedSwapAttribute(name: string): boolean {
  if (name === 'class' || name === 'id') return true;
  return name.startsWith('data-tina-') && name !== ENDPOINT_ATTR;
}

function swapIslandHtml(island: HTMLElement, html: string): void {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  const replacement = template.content.firstElementChild as HTMLElement | null;

  if (replacement) {
    for (const attr of Array.from(island.attributes)) {
      if (attr.name === ENDPOINT_ATTR) continue;
      island.removeAttribute(attr.name);
    }
    for (const attr of Array.from(replacement.attributes)) {
      if (!isAllowedSwapAttribute(attr.name)) continue;
      island.setAttribute(attr.name, attr.value);
    }
    island.innerHTML = replacement.innerHTML;
  } else {
    island.innerHTML = html;
  }
}
