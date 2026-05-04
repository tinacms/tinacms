import { debug } from './debug';
import type { DataStore, FormPayload } from './types';

/**
 * Reads server-emitted form payloads from <script type="application/tina+json">
 * blocks (one per query the page consumes), seeds the data-store, and tells
 * the admin which forms this page hosts via `{type:'open', ...}`.
 *
 * Re-posts each `open` until the admin acknowledges by sending an
 * `updateData` for that id. The bridge boots faster than React, so the
 * very first `open` can land before the admin's window-message handler
 * is registered; without retry it would be silently dropped.
 */
const SCRIPT_TYPE = 'application/tina+json';
const RETRY_INTERVAL_MS = 250;
const MAX_ATTEMPTS = 40; // 10s total — plenty for cold-start admins.

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
      // Seed silently: the admin's first updateData will trigger the
      // initial island refresh; we don't want a redundant refetch on
      // page load just because forms registered themselves.
      store.seed(payload.id, payload.data ?? {});
    } catch (error) {
      debug('failed to parse form payload', error);
    }
  }

  debug('discovered', payloads.length, 'form(s)');

  const acknowledged = new Set<string>();

  const onAck = (event: MessageEvent) => {
    const msg = event.data;
    if (!msg || typeof msg !== 'object') return;
    if (msg.type !== 'updateData' || typeof msg.id !== 'string') return;
    if (!acknowledged.has(msg.id)) {
      debug('admin acked form', msg.id);
      acknowledged.add(msg.id);
    }
  };
  window.addEventListener('message', onAck);

  let attempts = 0;
  const announce = () => {
    attempts++;
    const pending = payloads.filter((p) => !acknowledged.has(p.id));
    if (pending.length === 0) {
      debug('all forms acked after', attempts, 'attempt(s)');
      return;
    }
    if (attempts > MAX_ATTEMPTS) {
      debug(
        'giving up after',
        MAX_ATTEMPTS,
        'attempts; pending ids:',
        pending.map((p) => p.id),
      );
      return;
    }
    for (const payload of pending) {
      debug('posting open for', payload.id, 'attempt', attempts);
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
    setTimeout(announce, RETRY_INTERVAL_MS);
  };
  announce();

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
