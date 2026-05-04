import type { DataStore, FormPayload } from './types';

/**
 * Reads server-emitted form payloads from <script type="application/tina+json">
 * blocks (one per query the page consumes), seeds the data-store, and tells
 * the admin which forms this page hosts via `{type:'open', ...}`.
 *
 * Each payload mirrors the props that useTina receives in React:
 *   { id, query, variables, data }
 *
 * Subsequent `{type:'updateData', id, data}` messages from the admin land
 * via initIslandRefresh's listener — this module only does the initial
 * registration handshake.
 */
const SCRIPT_TYPE = 'application/tina+json';

export function initForms(store: DataStore): void {
  const scripts = document.querySelectorAll<HTMLScriptElement>(
    `script[type="${SCRIPT_TYPE}"]`,
  );

  const payloads: FormPayload[] = [];
  for (const script of scripts) {
    const raw = script.textContent;
    if (!raw) continue;
    try {
      const payload = JSON.parse(raw) as FormPayload;
      if (!payload.id || !payload.query) continue;
      payloads.push(payload);
      store.set(payload.id, payload.data ?? {});
    } catch {
      // Malformed payload — skip silently rather than break the bridge.
    }
  }

  for (const payload of payloads) {
    window.parent.postMessage(
      {
        type: 'open',
        id: payload.id,
        query: payload.query,
        variables: payload.variables,
        data: payload.data,
      },
      window.location.origin,
    );
  }

  reportQuickEdit();

  window.addEventListener('beforeunload', () => {
    for (const payload of payloads) {
      window.parent.postMessage(
        { type: 'close', id: payload.id },
        window.location.origin,
      );
    }
  });
}

export function reportQuickEdit(): void {
  const hasMarkers = !!document.querySelector('[data-tina-field]');
  window.parent.postMessage(
    { type: 'quick-edit', value: hasMarkers },
    window.location.origin,
  );
}
