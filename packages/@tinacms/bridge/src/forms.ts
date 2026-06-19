import { getAdminOrigin, isFromAdmin } from './config';
import { debug } from './debug';
import type { DataStore, FormPayload } from './types';

export const FORM_SELECTOR = '[data-tina-form]';
export const FORM_ATTR = 'data-tina-form';
export const PRIMARY_FORM_ATTR = 'data-tina-primary';
const RETRY_INTERVAL_MS = 250;
const MAX_ATTEMPTS = 40; // 10s — covers cold-start admins.

interface FormsController {
  store: DataStore;
  active: Map<string, FormPayload>;
  acknowledged: Set<string>;
  primaryId: string | null;
  retryTimer: ReturnType<typeof setTimeout> | null;
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
    primaryId: null,
    retryTimer: null,
    attempts: 0,
  };

  window.addEventListener('message', onAck);
  window.addEventListener('beforeunload', onBeforeUnload);
}

/** Diff active forms against the DOM and post the deltas. Safe to call
 *  before init() — no-op then. */
export function refreshForms(): void {
  if (!controller) {
    debug('refreshForms called before initForms; ignoring');
    return;
  }

  const { payloads: next, primaryId } = readPayloads();
  const nextIds = new Set(next.map((p) => p.id));

  for (const [id] of controller.active) {
    if (nextIds.has(id)) continue;
    debug('posting close for', id);
    window.parent.postMessage({ type: 'close', id }, getAdminOrigin());
    controller.acknowledged.delete(id);
  }

  for (const payload of next) {
    controller.store.seed(payload.id, payload.data ?? {});
  }

  controller.active = new Map(next.map((p) => [p.id, p]));
  controller.primaryId = primaryId && nextIds.has(primaryId) ? primaryId : null;

  if (next.some((p) => !controller!.acknowledged.has(p.id))) {
    startAnnounceLoop();
  }

  reportQuickEdit();
}

function readPayloads(): { payloads: FormPayload[]; primaryId: string | null } {
  const elements = document.querySelectorAll<HTMLElement>(FORM_SELECTOR);
  const payloads: FormPayload[] = [];
  let primaryId: string | null = null;
  for (const el of elements) {
    const raw = el.getAttribute(FORM_ATTR);
    if (!raw) continue;
    try {
      const payload = JSON.parse(raw) as FormPayload;
      if (!payload.id || !payload.query) continue;
      payloads.push(payload);
      if (primaryId === null && el.hasAttribute(PRIMARY_FORM_ATTR)) {
        primaryId = payload.id;
      }
    } catch (error) {
      debug('failed to parse form payload', error);
    }
  }
  debug('discovered', payloads.length, 'form(s)');
  return { payloads, primaryId };
}

function onAck(event: MessageEvent) {
  if (!isFromAdmin(event)) return;
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
    window.parent.postMessage({ type: 'close', id }, getAdminOrigin());
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
      getAdminOrigin()
    );
  }
  // Nudge the admin to open the primary form. Rides the retry loop
  // (primaryId only appears in `pending` while unacked).
  if (
    controller.primaryId &&
    pending.some((p) => p.id === controller!.primaryId)
  ) {
    window.parent.postMessage(
      { type: 'user-select-form', formId: controller.primaryId },
      getAdminOrigin()
    );
  }
  controller.retryTimer = setTimeout(announce, RETRY_INTERVAL_MS);
}

export function reportQuickEdit(): void {
  const hasMarkers = !!document.querySelector('[data-tina-field]');
  window.parent.postMessage(
    { type: 'quick-edit', value: hasMarkers },
    getAdminOrigin()
  );
}
