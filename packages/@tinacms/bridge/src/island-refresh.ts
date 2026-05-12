import { isFromAdmin } from './config';
import { debug } from './debug';
import { reportQuickEdit } from './forms';
import {
  PREVIEW_CONTENT_TYPE,
  PRIME_HEADER,
  type PreviewEnvelope,
} from './preview';
import type { DataStore } from './types';

/**
 * Listens for `{type:'updateData', id, data}` from the admin and re-fetches
 * every `[data-tina-island]` on the page with the unsaved data attached as
 * a JSON POST body. The island endpoint reads the body via `readOverlay()`
 * from `@tinacms/bridge/preview` and renders with overlay data instead of
 * hitting the canonical content store.
 *
 * Why POST: HTTP headers are capped at ~8 KB (server-dependent) — large
 * posts overflow easily — and are restricted to Latin-1 so UTF-8 content
 * needs base64 padding. A POST body has neither limit and round-trips
 * UTF-8 directly.
 *
 * The very first updateData fires immediately so newly-created docs leave
 * the empty-template state ASAP. Subsequent updates collapse into a single
 * debounced refetch — each refresh re-renders every island anyway, so a
 * per-id timer would just fire N redundant times for the same DOM scan.
 */
export interface IslandRefreshOptions {
  debounceMs: number;
}

const ISLAND_SELECTOR = '[data-tina-island]';
const ENDPOINT_ATTR = 'data-tina-island';
const FORM_SELECTOR = '[data-tina-form]';

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
    const html = await response.text();
    swapIslandHtml(island, html);
    reportQuickEdit();
  } catch (error) {
    debug('island refetch error', endpoint, error);
  }
}

/**
 * One-time hydration for statically-built pages. The `tina()` middleware
 * only injects `[data-tina-form]` payloads on on-demand-rendered responses,
 * so a prerendered page in the admin iframe has none — without them the
 * bridge has nothing to announce and the admin never sends `updateData`.
 *
 * Fetch each island endpoint with the prime header set; the endpoint
 * answers with the page's `<div data-tina-form>` payloads prepended to the
 * region HTML. Move those payloads into the document so a follow-up
 * `refreshForms()` (caller's responsibility) picks them up and announces
 * them. The region HTML itself already shows canonical data on the static
 * page, so it isn't swapped here — the first real `updateData` does that.
 *
 * No-op on SSR pages: the caller only invokes this when no
 * `[data-tina-form]` is present.
 */
export async function primeIslands(): Promise<void> {
  const islands = document.querySelectorAll<HTMLElement>(ISLAND_SELECTOR);
  for (const island of islands) {
    const endpoint = island.getAttribute(ENDPOINT_ATTR);
    if (!endpoint) continue;
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
        continue;
      }
      const template = document.createElement('template');
      template.innerHTML = (await response.text()).trim();
      for (const formEl of Array.from(
        template.content.querySelectorAll<HTMLElement>(FORM_SELECTOR)
      )) {
        document.body.appendChild(formEl);
      }
    } catch (error) {
      debug('island prime error', endpoint, error);
    }
  }
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
      island.setAttribute(attr.name, attr.value);
    }
    island.innerHTML = replacement.innerHTML;
  } else {
    island.innerHTML = html;
  }
}
