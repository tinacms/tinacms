import { isFromAdmin } from './config';
import { debug } from './debug';
import { FORM_SELECTOR, PRIMARY_FORM_ATTR, reportQuickEdit } from './forms';
import {
  PREVIEW_CONTENT_TYPE,
  PRIME_HEADER,
  type PreviewEnvelope,
} from './preview';
import type { DataStore } from './types';

/**
 * Listen for admin `updateData` events and re-fetch every island on the
 * page with the unsaved data POSTed as a JSON body. POST (vs header)
 * avoids the ~8KB Latin-1 cap. Refetches collapse into one debounced
 * pass (every refresh re-renders every island).
 */
export interface IslandRefreshOptions {
  debounceMs: number;
}

const ISLAND_SELECTOR = '[data-tina-island]';
const ENDPOINT_ATTR = 'data-tina-island';
const PRIMARY_ISLAND_ATTR = 'data-tina-island-primary';
/** Marks a `[data-tina-form]` div that a prime pass appended (vs. one the
 *  server injected), so a later re-scan can drop it before re-priming. */
export const PRIMED_FORM_ATTR = 'data-tina-primed';

export function initIslandRefresh(
  store: DataStore,
  options: IslandRefreshOptions
): void {
  let pendingRefresh: ReturnType<typeof setTimeout> | null = null;

  const refreshAll = () => {
    const islands = document.querySelectorAll<HTMLElement>(ISLAND_SELECTOR);
    for (const island of islands) {
      void refreshIsland(island, store);
    }
  };

  store.subscribe(({ firstUpdate }) => {
    if (pendingRefresh) {
      clearTimeout(pendingRefresh);
      pendingRefresh = null;
    }

    if (firstUpdate) {
      refreshAll();
      return;
    }

    pendingRefresh = setTimeout(() => {
      pendingRefresh = null;
      refreshAll();
    }, options.debounceMs);
  });

  window.addEventListener('message', (event) => {
    if (!isFromAdmin(event)) return;
    const message = event.data;
    if (!message || typeof message !== 'object') return;

    if (message.type === 'updateData' && typeof message.id === 'string') {
      if (!store.has(message.id)) {
        debug('updateData for unknown id', message.id, '— ignoring');
        return;
      }
      debug('updateData received for', message.id);
      store.set(message.id, message.data ?? {});
    }
  });
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
 * its attribute surface.
 */
function isAllowedSwapAttribute(name: string): boolean {
  if (name === 'class' || name === 'id') return true;
  return name.startsWith('data-tina-');
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
