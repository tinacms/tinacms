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
 *
 * `initForms` runs once per page load. `refreshForms` re-scans the DOM
 * after a soft navigation (Astro view transitions, Turbo, htmx, etc.):
 * it diffs the live `<script type="application/tina+json">` blocks
 * against the previously-mounted set, posts `close` for forms that
 * disappeared, and `open` (with retry) for forms that appeared.
 */
const SCRIPT_TYPE = 'application/tina+json';
const RETRY_INTERVAL_MS = 250;
const MAX_ATTEMPTS = 40; // 10s total — plenty for cold-start admins.

interface FormsController {
  store: DataStore;
  /** Form ids currently mounted in the DOM. Diffed on each refresh. */
  active: Map<string, FormPayload>;
  /** Ids the admin has acknowledged via `updateData`. Survives refreshes. */
  acknowledged: Set<string>;
  /** Pending retry timer for the announce loop, if any. */
  retryTimer: ReturnType<typeof setTimeout> | null;
  /** Attempt counter for the current announce loop. */
  attempts: number;
}

let controller: FormsController | null = null;

export function initForms(store: DataStore): void {
  if (controller) {
    debug('initForms called twice; ignoring');
    return;
  }

  controller = {
    store,
    active: new Map(),
    acknowledged: new Set(),
    retryTimer: null,
    attempts: 0,
  };

  // One-time listeners. The ack handler stays bound for the lifetime of
  // the iframe so subsequent refreshes share the same `acknowledged`
  // set. The beforeunload handler closes whatever's mounted right now,
  // so soft-nav close messages are handled by `refreshForms`'s diff.
  window.addEventListener('message', onAck);
  window.addEventListener('beforeunload', onBeforeUnload);

  refreshForms();
}

/**
 * Re-scan the DOM for form payloads after a soft navigation. Diff
 * against the previous mount and post `close` / `open` for the delta.
 *
 * Safe to call even if the bridge isn't initialised — used for setups
 * that wire `astro:page-load` unconditionally. No-op outside an iframe.
 */
export function refreshForms(): void {
  if (!controller) {
    debug('refreshForms called before initForms; ignoring');
    return;
  }

  const next = readPayloads();
  const nextIds = new Set(next.map((p) => p.id));

  // Forms that left the page.
  for (const [id] of controller.active) {
    if (nextIds.has(id)) continue;
    debug('posting close for', id);
    window.parent.postMessage(
      { type: 'close', id },
      window.location.origin
    );
    controller.acknowledged.delete(id);
  }

  // Forms that arrived (or whose payload changed across a same-id remount).
  for (const payload of next) {
    controller.store.seed(payload.id, payload.data ?? {});
  }

  controller.active = new Map(next.map((p) => [p.id, p]));

  // Restart the announce loop only when there's something unacked to
  // announce. This is also the path the initial mount takes.
  if (next.some((p) => !controller!.acknowledged.has(p.id))) {
    startAnnounceLoop();
  }

  reportQuickEdit();
}

function readPayloads(): FormPayload[] {
  const scripts = document.querySelectorAll<HTMLScriptElement>(
    `script[type="${SCRIPT_TYPE}"]`
  );
  const payloads: FormPayload[] = [];
  for (const script of scripts) {
    const raw = script.textContent;
    if (!raw) continue;
    try {
      const payload = JSON.parse(raw) as FormPayload;
      if (!payload.id || !payload.query) continue;
      payloads.push(payload);
    } catch (error) {
      debug('failed to parse form payload', error);
    }
  }
  debug('discovered', payloads.length, 'form(s)');
  return payloads;
}

function onAck(event: MessageEvent) {
  const msg = event.data;
  if (!msg || typeof msg !== 'object') return;
  if (msg.type !== 'updateData' || typeof msg.id !== 'string') return;
  if (!controller) return;
  if (!controller.acknowledged.has(msg.id)) {
    debug('admin acked form', msg.id);
    controller.acknowledged.add(msg.id);
  }
}

function onBeforeUnload() {
  if (!controller) return;
  for (const [id] of controller.active) {
    window.parent.postMessage(
      { type: 'close', id },
      window.location.origin
    );
  }
}

function startAnnounceLoop() {
  if (!controller) return;
  if (controller.retryTimer) {
    clearTimeout(controller.retryTimer);
    controller.retryTimer = null;
  }
  controller.attempts = 0;
  announce();
}

function announce() {
  if (!controller) return;
  controller.attempts++;

  const pending: FormPayload[] = [];
  for (const [id, payload] of controller.active) {
    if (!controller.acknowledged.has(id)) pending.push(payload);
  }

  if (pending.length === 0) {
    debug('all forms acked after', controller.attempts, 'attempt(s)');
    controller.retryTimer = null;
    return;
  }
  if (controller.attempts > MAX_ATTEMPTS) {
    debug(
      'giving up after',
      MAX_ATTEMPTS,
      'attempts; pending ids:',
      pending.map((p) => p.id)
    );
    controller.retryTimer = null;
    return;
  }

  for (const payload of pending) {
    debug('posting open for', payload.id, 'attempt', controller.attempts);
    window.parent.postMessage(
      {
        type: 'open',
        id: payload.id,
        query: payload.query,
        variables: payload.variables,
        data: payload.data,
      },
      window.location.origin
    );
  }
  controller.retryTimer = setTimeout(announce, RETRY_INTERVAL_MS);
}

export function reportQuickEdit(): void {
  const hasMarkers = !!document.querySelector('[data-tina-field]');
  window.parent.postMessage(
    { type: 'quick-edit', value: hasMarkers },
    window.location.origin
  );
}
