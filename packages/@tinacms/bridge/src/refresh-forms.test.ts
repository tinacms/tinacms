import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PRIME_HEADER } from './preview';

async function loadBridge() {
  vi.resetModules();
  const { setAdminOrigin } = await import('./config');
  setAdminOrigin('https://admin.test');
  const bridge = await import('./index');
  // init() with an empty body so `running` flips and listeners wire up;
  // individual tests populate the DOM after this and drive refreshForms.
  bridge.init({ adminOrigin: 'https://admin.test' });
  return bridge;
}

describe('refreshForms (public wrapper)', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let parentDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    // forms.ts schedules a 250ms `setTimeout(announce, ...)` retry whenever
    // it discovers payloads. vi.resetModules() between tests can't cancel
    // the prior module's pending timer, so it leaks past teardown and fires
    // into a torn-down happy-dom (window gone → ReferenceError). Fake timers
    // keep the retry queued but never fired, matching the existing pattern
    // in forms.test.ts.
    vi.useFakeTimers();
    document.body.innerHTML = '';
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    parentDescriptor = Object.getOwnPropertyDescriptor(window, 'parent');
    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: { postMessage: () => {} },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    if (parentDescriptor) {
      Object.defineProperty(window, 'parent', parentDescriptor);
    }
  });

  it('primes from island endpoints when the page has islands but no server-injected forms', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        `<div data-tina-form='${JSON.stringify({
          id: 'abc',
          query: 'query Post',
          variables: {},
          data: { title: 'Hi' },
        })}' hidden></div>` +
          `<article data-tina-island="/tina-island/post?slug=hello"><h1>Hi</h1></article>`,
        { headers: { 'Content-Type': 'text/html' } }
      )
    );

    const bridge = await loadBridge();
    document.body.innerHTML = `
      <article data-tina-island="/tina-island/post?slug=hello">existing</article>
    `;
    bridge.refreshForms();
    // Wait a microtask for the void promise inside refreshForms to settle.
    await vi.waitFor(() => {
      expect(document.querySelector('[data-tina-form]')).not.toBeNull();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0]!;
    expect(init.headers[PRIME_HEADER]).toBe('1');
  });

  it('skips priming when server-injected payloads are already present', async () => {
    const bridge = await loadBridge();
    document.body.innerHTML =
      `<div data-tina-form='${JSON.stringify({
        id: 'srv',
        query: 'query Page',
        variables: {},
        data: {},
      })}' hidden></div>` +
      `<article data-tina-island="/tina-island/page">existing</article>`;
    bridge.refreshForms();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not prime when the page has no islands', async () => {
    const bridge = await loadBridge();
    document.body.innerHTML = `<main>just content, no Tina</main>`;
    bridge.refreshForms();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('is a no-op when init() ran outside the admin iframe', async () => {
    // Simulate a non-iframe context: window.parent === window. The outer
    // beforeEach replaced `window.parent` with a distinct object — restore
    // identity here so the iframe check inside init() trips the no-op path.
    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: window,
    });
    vi.resetModules();
    const { setAdminOrigin } = await import('./config');
    setAdminOrigin('https://admin.test');
    const bridge = await import('./index');
    bridge.init({ adminOrigin: 'https://admin.test' });

    document.body.innerHTML = `
      <article data-tina-island="/tina-island/post">existing</article>
    `;
    bridge.refreshForms();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(document.querySelector('[data-tina-primed]')).toBeNull();
  });

  it('re-primes against the new page when a navigation lands mid-prime', async () => {
    const formHtml = (endpoint: string) =>
      `<div data-tina-form='${JSON.stringify({
        id: endpoint,
        query: 'query Doc',
        variables: {},
        data: {},
      })}' hidden></div>`;
    const formResponse = (endpoint: string) =>
      new Response(formHtml(endpoint), {
        headers: { 'Content-Type': 'text/html' },
      });

    // The first page's prime stays in flight until we resolve it manually,
    // modelling a slow endpoint.
    let resolveFirst: (response: Response) => void = () => {};
    const firstResponse = new Promise<Response>((resolve) => {
      resolveFirst = resolve;
    });
    fetchMock.mockImplementation((url: string) =>
      url === '/tina-island/a'
        ? firstResponse
        : Promise.resolve(formResponse(url))
    );

    const bridge = await loadBridge();
    document.body.innerHTML = `<article data-tina-island="/tina-island/a">A</article>`;
    bridge.refreshForms();

    // Soft navigation swaps in a different page before the first prime resolves.
    document.body.innerHTML = `<article data-tina-island="/tina-island/b">B</article>`;
    bridge.refreshForms();

    resolveFirst(formResponse('/tina-island/a'));

    await vi.waitFor(() => {
      const forms = document.querySelectorAll('[data-tina-form]');
      expect(forms).toHaveLength(1);
      expect(forms[0]?.getAttribute('data-tina-form')).toContain(
        '/tina-island/b'
      );
    });

    const urls = fetchMock.mock.calls.map(([url]) => url);
    expect(urls).toContain('/tina-island/a');
    expect(urls).toContain('/tina-island/b');
  });
});
