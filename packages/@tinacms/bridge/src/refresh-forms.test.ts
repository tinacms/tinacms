import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PRIME_HEADER } from './preview';

async function loadBridge() {
  vi.resetModules();
  const { setAdminOrigin } = await import('./config');
  setAdminOrigin('https://admin.test');
  return import('./index');
}

describe('refreshForms (public wrapper)', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let parentDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
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
    vi.unstubAllGlobals();
    if (parentDescriptor) {
      Object.defineProperty(window, 'parent', parentDescriptor);
    }
  });

  it('primes from island endpoints when the page has islands but no server-injected forms', async () => {
    document.body.innerHTML = `
      <article data-tina-island="/tina-island/post?slug=hello">existing</article>
    `;
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
    document.body.innerHTML =
      `<div data-tina-form='${JSON.stringify({
        id: 'srv',
        query: 'query Page',
        variables: {},
        data: {},
      })}' hidden></div>` +
      `<article data-tina-island="/tina-island/page">existing</article>`;

    const bridge = await loadBridge();
    bridge.refreshForms();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not prime when the page has no islands', async () => {
    document.body.innerHTML = `<main>just content, no Tina</main>`;

    const bridge = await loadBridge();
    bridge.refreshForms();

    expect(fetchMock).not.toHaveBeenCalled();
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

    document.body.innerHTML = `<article data-tina-island="/tina-island/a">A</article>`;
    const bridge = await loadBridge();
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
