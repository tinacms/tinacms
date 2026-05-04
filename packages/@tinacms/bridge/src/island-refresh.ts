import { debug } from './debug';
import { PREVIEW_CONTENT_TYPE, type PreviewEnvelope } from './preview';
import type { DataStore } from './types';
import { reportQuickEdit } from './forms';

/**
 * Listens for `{type:'updateData', id, data}` from the admin and re-fetches
 * each `[data-tina-island]` with the unsaved data attached as a JSON POST
 * body. The island endpoint reads the body via `readOverlay()` from
 * `@tinacms/bridge/preview` and renders with overlay data instead of
 * hitting the canonical content store.
 *
 * Why POST: HTTP headers are capped at ~8 KB (server-dependent) — large
 * posts overflow easily — and are restricted to Latin-1 so UTF-8 content
 * needs base64 padding. A POST body has neither limit and round-trips
 * UTF-8 directly.
 *
 * The very first updateData per form fires immediately so newly-created
 * docs leave the empty-template state ASAP. Subsequent updates are
 * debounced.
 */
export interface IslandRefreshOptions {
  debounceMs: number;
}

const ISLAND_SELECTOR = '[data-tina-island]';
const ENDPOINT_ATTR = 'data-tina-island';

export function initIslandRefresh(store: DataStore, options: IslandRefreshOptions): void {
  const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

  const refreshAll = () => {
    const islands = document.querySelectorAll<HTMLElement>(ISLAND_SELECTOR);
    for (const island of islands) {
      void refreshIsland(island, store);
    }
  };

  store.subscribe(({ firstUpdate }) => {
    const key = '__all__';
    const existing = debounceTimers.get(key);
    if (existing) clearTimeout(existing);

    if (firstUpdate) {
      refreshAll();
      return;
    }

    debounceTimers.set(
      key,
      setTimeout(() => {
        debounceTimers.delete(key);
        refreshAll();
      }, options.debounceMs),
    );
  });

  window.addEventListener('message', (event) => {
    const message = event.data;
    if (!message || typeof message !== 'object') return;

    if (message.type === 'updateData' && typeof message.id === 'string') {
      debug('updateData received for', message.id);
      store.set(message.id, message.data ?? {});
    }
  });
}

async function refreshIsland(island: HTMLElement, store: DataStore): Promise<void> {
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
    const html = await response.text();
    swapIslandHtml(island, html);
    reportQuickEdit();
  } catch (error) {
    debug('island refetch error', endpoint, error);
  }
}

function swapIslandHtml(island: HTMLElement, html: string): void {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  const fragment = template.content;
  const replacement = fragment.firstElementChild as HTMLElement | null;

  if (replacement) {
    for (const attr of Array.from(island.attributes)) {
      if (attr.name === ENDPOINT_ATTR) continue;
      island.removeAttribute(attr.name);
    }
    for (const attr of Array.from(replacement.attributes)) {
      island.setAttribute(attr.name, attr.value);
    }
    island.innerHTML = replacement.innerHTML;
  } else {
    island.innerHTML = html;
  }
}
