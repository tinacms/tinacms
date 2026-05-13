import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Verifies the bridge's `priority: 'primary'` handling: when a server
 * marks one of the page's form payloads as primary, the bridge sends a
 * `user-select-form` postMessage so the admin focuses that form instead
 * of falling back to its own "first non-global wins" heuristic.
 */
async function loadBridge() {
  vi.resetModules();
  const { setAdminOrigin } = await import('./config');
  setAdminOrigin('https://admin.test');
  return import('./index');
}

function payload(id: string, extras: Record<string, unknown> = {}): string {
  return JSON.stringify({
    id,
    query: `query Q_${id}`,
    variables: {},
    data: {},
    ...extras,
  });
}

describe('selectPrimary', () => {
  let postMessage: ReturnType<typeof vi.fn>;
  let parentDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    document.body.innerHTML = '';
    postMessage = vi.fn();
    parentDescriptor = Object.getOwnPropertyDescriptor(window, 'parent');
    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: { postMessage },
    });
  });

  afterEach(() => {
    if (parentDescriptor) {
      Object.defineProperty(window, 'parent', parentDescriptor);
    }
  });

  it('posts user-select-form for a primary payload', async () => {
    document.body.innerHTML =
      `<div data-tina-form='${payload('page', { priority: 'primary' })}' hidden></div>` +
      `<div data-tina-form='${payload('global')}' hidden></div>`;

    const bridge = await loadBridge();
    bridge.init({ adminOrigin: 'https://admin.test' });

    const selects = postMessage.mock.calls.filter(
      ([msg]) => msg?.type === 'user-select-form'
    );
    expect(selects).toHaveLength(1);
    expect(selects[0]![0]).toEqual({
      type: 'user-select-form',
      formId: 'page',
    });
  });

  it('does not send user-select-form when no primary is present', async () => {
    document.body.innerHTML =
      `<div data-tina-form='${payload('a')}' hidden></div>` +
      `<div data-tina-form='${payload('b')}' hidden></div>`;

    const bridge = await loadBridge();
    bridge.init({ adminOrigin: 'https://admin.test' });

    const selects = postMessage.mock.calls.filter(
      ([msg]) => msg?.type === 'user-select-form'
    );
    expect(selects).toHaveLength(0);
  });

  it('does not re-send for the same primary id across consecutive refreshes', async () => {
    document.body.innerHTML = `<div data-tina-form='${payload('page', { priority: 'primary' })}' hidden></div>`;

    const bridge = await loadBridge();
    bridge.init({ adminOrigin: 'https://admin.test' });
    // A second refresh with the same DOM (e.g. spurious astro:page-load).
    bridge.refreshForms();

    const selects = postMessage.mock.calls.filter(
      ([msg]) => msg?.type === 'user-select-form'
    );
    expect(selects).toHaveLength(1);
  });

  it('re-sends when the primary id changes (soft-nav to a new page)', async () => {
    document.body.innerHTML = `<div data-tina-form='${payload('page-1', { priority: 'primary' })}' hidden></div>`;

    const bridge = await loadBridge();
    bridge.init({ adminOrigin: 'https://admin.test' });

    document.body.innerHTML = `<div data-tina-form='${payload('page-2', { priority: 'primary' })}' hidden></div>`;
    bridge.refreshForms();

    const selects = postMessage.mock.calls
      .filter(([msg]) => msg?.type === 'user-select-form')
      .map(([msg]) => msg.formId);
    expect(selects).toEqual(['page-1', 'page-2']);
  });
});
