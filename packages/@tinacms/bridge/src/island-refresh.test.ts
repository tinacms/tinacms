import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initDataStore } from './data-store';
import { initIslandRefresh, primeIslands } from './island-refresh';
import { PREVIEW_CONTENT_TYPE, PRIME_HEADER } from './preview';

/**
 * `primeIslands` is the static-page hydration path: it POSTs each
 * `[data-tina-island]` endpoint with the prime header and moves the
 * `<div data-tina-form>` payloads the endpoint returns into the document
 * so a follow-up `refreshForms()` can announce them.
 */
describe('primeIslands', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    document.body.innerHTML = '';
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches each island with the prime header and harvests form payloads', async () => {
    document.body.innerHTML = `
      <article data-tina-island="/tina-island/post?slug=hello">existing</article>
    `;
    const formPayload = {
      id: 'abc',
      query: 'query Post',
      variables: {},
      data: { title: 'Hi' },
    };
    fetchMock.mockResolvedValue(
      new Response(
        `<div data-tina-form='${JSON.stringify(formPayload)}' hidden></div>` +
          `<article data-tina-island="/tina-island/post?slug=hello"><h1>Hi</h1></article>`,
        { headers: { 'Content-Type': 'text/html' } }
      )
    );

    await primeIslands();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint, init] = fetchMock.mock.calls[0]!;
    expect(endpoint).toBe('/tina-island/post?slug=hello');
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe(PREVIEW_CONTENT_TYPE);
    expect(init.headers[PRIME_HEADER]).toBe('1');

    const formEl = document.querySelector('[data-tina-form]');
    expect(formEl).not.toBeNull();
    expect(JSON.parse(formEl!.getAttribute('data-tina-form')!)).toEqual(
      formPayload
    );
    // The region itself is left untouched on prime.
    expect(document.querySelector('article')!.textContent).toContain(
      'existing'
    );
  });

  it('ignores a failed island response without throwing', async () => {
    document.body.innerHTML = `<article data-tina-island="/tina-island/post"></article>`;
    fetchMock.mockResolvedValue(new Response('nope', { status: 500 }));

    await expect(primeIslands()).resolves.toBeUndefined();
    expect(document.querySelector('[data-tina-form]')).toBeNull();
  });

  it('does nothing when the page has no islands', async () => {
    document.body.innerHTML = `<main>just content</main>`;
    await primeIslands();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('tags the first form of a data-tina-island-primary island', async () => {
    document.body.innerHTML = `
      <header data-tina-island="/tina-island/global"></header>
      <main data-tina-island="/tina-island/post?slug=hello" data-tina-island-primary></main>
    `;
    const globalForm = {
      id: 'g',
      query: 'query Global',
      variables: {},
      data: {},
    };
    const postForm = { id: 'p', query: 'query Post', variables: {}, data: {} };
    fetchMock.mockImplementation((endpoint: string) => {
      const form = endpoint.startsWith('/tina-island/global')
        ? globalForm
        : postForm;
      return Promise.resolve(
        new Response(
          `<div data-tina-form='${JSON.stringify(form)}' hidden></div><main></main>`,
          { headers: { 'Content-Type': 'text/html' } }
        )
      );
    });

    await primeIslands();

    const primary = document.querySelector(
      '[data-tina-form][data-tina-primary]'
    );
    expect(primary).not.toBeNull();
    expect(JSON.parse(primary!.getAttribute('data-tina-form')!).id).toBe('p');
    // The non-primary island's form is not tagged.
    const allForms = document.querySelectorAll('[data-tina-form]');
    expect(allForms.length).toBe(2);
    expect(
      [...allForms].filter((el) => el.hasAttribute('data-tina-primary')).length
    ).toBe(1);
  });
});

/**
 * `initIslandRefresh` re-fetches islands when the admin sends unsaved data.
 * The first update for a form skips the debounce, so a single `set` on a
 * seeded store triggers one immediate pass.
 */
describe('initIslandRefresh', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    document.body.innerHTML = '';
    fetchMock = vi.fn((endpoint: string) =>
      Promise.resolve(
        new Response(
          `<article data-tina-island="${endpoint}"><h1>From server</h1></article>`,
          { headers: { 'Content-Type': 'text/html' } }
        )
      )
    );
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function update(): Promise<void> {
    const store = initDataStore();
    store.seed('post', { title: 'Published' });
    initIslandRefresh(store, { debounceMs: 0 });
    store.set('post', { title: 'Unsaved' });
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
    // Let the fetched HTML land before asserting on the DOM.
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  it('re-fetches an island with the unsaved data and swaps its content', async () => {
    document.body.innerHTML = `<article data-tina-island="/tina-island/post"><h1>Published</h1></article>`;

    await update();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint, init] = fetchMock.mock.calls[0]!;
    expect(endpoint).toBe('/tina-island/post');
    expect(init.headers[PRIME_HEADER]).toBeUndefined();
    expect(JSON.parse(init.body)).toEqual({ post: { title: 'Unsaved' } });
    expect(document.querySelector('h1')!.textContent).toBe('From server');
  });

  it('never re-fetches a managed island and leaves its nodes in place', async () => {
    document.body.innerHTML = `
      <article data-tina-island="/tina-island/post" data-tina-island-managed><h1>Client</h1></article>
      <header data-tina-island="/tina-island/header"><h1>Header</h1></header>
    `;
    const managedHeading = document.querySelector('article h1')!;

    await update();

    expect(fetchMock.mock.calls.map(([endpoint]) => endpoint)).toEqual([
      '/tina-island/header',
    ]);
    expect(managedHeading.isConnected).toBe(true);
    expect(document.querySelector('article h1')).toBe(managedHeading);
    expect(managedHeading.textContent).toBe('Client');
    expect(document.querySelector('header h1')!.textContent).toBe(
      'From server'
    );
  });

  it('still primes a managed island', async () => {
    document.body.innerHTML = `<article data-tina-island="/tina-island/post" data-tina-island-managed data-tina-island-primary></article>`;
    fetchMock.mockResolvedValue(
      new Response(
        `<div data-tina-form='{"id":"post","query":"query Post","variables":{},"data":{}}' hidden></div>`,
        { headers: { 'Content-Type': 'text/html' } }
      )
    );

    await primeIslands();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]![1].headers[PRIME_HEADER]).toBe('1');
    expect(
      document.querySelector('[data-tina-form][data-tina-primary]')
    ).not.toBeNull();
  });
});
