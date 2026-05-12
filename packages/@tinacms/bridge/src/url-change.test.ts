import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// `initUrlChange` keeps module-level state, so each test re-imports it
// (with `config` re-seeded post-reset) to start from a clean slate.
async function loadUrlChange() {
  vi.resetModules();
  const { setAdminOrigin } = await import('./config');
  setAdminOrigin('https://admin.test');
  return import('./url-change');
}

describe('initUrlChange', () => {
  let postedMessages: Array<{ data: unknown; targetOrigin: string }>;
  let originalPushState: typeof history.pushState;
  let originalReplaceState: typeof history.replaceState;
  let parentDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    postedMessages = [];
    originalPushState = window.history.pushState;
    originalReplaceState = window.history.replaceState;
    parentDescriptor = Object.getOwnPropertyDescriptor(window, 'parent');

    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: {
        postMessage: (data: unknown, targetOrigin: string) => {
          postedMessages.push({ data, targetOrigin });
        },
      },
    });
    window.history.replaceState(null, '', '/start');
  });

  afterEach(() => {
    window.history.pushState = originalPushState;
    window.history.replaceState = originalReplaceState;
    if (parentDescriptor) {
      Object.defineProperty(window, 'parent', parentDescriptor);
    }
  });

  it('emits url-changed when history.pushState moves to a new URL', async () => {
    const { initUrlChange } = await loadUrlChange();
    initUrlChange();

    window.history.pushState(null, '', '/blog');

    expect(postedMessages).toEqual([
      { data: { type: 'url-changed' }, targetOrigin: 'https://admin.test' },
    ]);
  });

  it('suppresses emission when replaceState keeps the same URL', async () => {
    const { initUrlChange } = await loadUrlChange();
    initUrlChange();

    window.history.replaceState(null, '', '/start');

    expect(postedMessages).toHaveLength(0);
  });

  it('is idempotent — re-init does not double-wrap history methods', async () => {
    const { initUrlChange } = await loadUrlChange();
    initUrlChange();
    const afterFirst = window.history.pushState;
    initUrlChange();
    expect(window.history.pushState).toBe(afterFirst);

    window.history.pushState(null, '', '/once');

    expect(postedMessages).toHaveLength(1);
  });

  it('does nothing when not running inside an iframe', async () => {
    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: window,
    });
    const beforePush = window.history.pushState;
    const { initUrlChange } = await loadUrlChange();
    initUrlChange();
    expect(window.history.pushState).toBe(beforePush);

    window.history.pushState(null, '', '/noop');

    expect(postedMessages).toHaveLength(0);
  });
});
