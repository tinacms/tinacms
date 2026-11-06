import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setAdminOrigin } from './config';
import { initDataStore } from './data-store';
import { initIslandRefresh, primeIslands } from './island-refresh';
import { PREVIEW_CONTENT_TYPE, PRIME_HEADER } from './preview';

// initIslandRefresh adds a window `message` listener per call; drop them after
// each test so one test's store can't react to another test's messages.
let messageListeners: EventListenerOrEventListenerObject[] = [];

beforeEach(() => {
  messageListeners = [];
  const add = window.addEventListener.bind(window);
  vi.spyOn(window, 'addEventListener').mockImplementation(
    (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ) => {
      if (type === 'message') messageListeners.push(listener);
      add(type, listener, options);
    }
  );
});

afterEach(() => {
  for (const listener of messageListeners) {
    window.removeEventListener('message', listener);
  }
  vi.restoreAllMocks();
});

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

  it('ignores a response that a later refresh of the same island has superseded', async () => {
    document.body.innerHTML = `<article data-tina-island="/tina-island/post"><h1>Published</h1></article>`;
    const answers: Array<(heading: string) => void> = [];
    fetchMock.mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          answers.push((heading) =>
            resolve(
              new Response(
                `<article data-tina-island="/tina-island/post"><h1>${heading}</h1></article>`,
                { headers: { 'Content-Type': 'text/html' } }
              )
            )
          );
        })
    );
    const store = initDataStore();
    store.seed('post', { title: 'Published' });
    initIslandRefresh(store, { debounceMs: 0 });

    store.set('post', { title: 'First' });
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    store.set('post', { title: 'Second' });
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    answers[1]!('Second');
    await vi.waitFor(() =>
      expect(document.querySelector('h1')!.textContent).toBe('Second')
    );
    answers[0]!('First');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(document.querySelector('h1')!.textContent).toBe('Second');
  });

  it("keeps the page's endpoint when the response names a different one", async () => {
    document.body.innerHTML = `<article data-tina-island="/site/tina-island/post?slug=a"><h1>Published</h1></article>`;
    fetchMock.mockResolvedValue(
      new Response(
        `<article data-tina-island="/tina-island/post?slug=a" data-tina-island-forms="post"><h1>From server</h1></article>`,
        { headers: { 'Content-Type': 'text/html' } }
      )
    );

    await update();

    const island = document.querySelector('article')!;
    expect(island.getAttribute('data-tina-island')).toBe(
      '/site/tina-island/post?slug=a'
    );
    expect(island.getAttribute('data-tina-island-forms')).toBe('post');
    expect(island.querySelector('h1')!.textContent).toBe('From server');
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

describe('initIslandRefresh targeting', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let formsByEndpoint: Record<string, string>;
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = `
      <header data-tina-island="/tina-island/header"></header>
      <article data-tina-island="/tina-island/post"></article>
      <footer data-tina-island="/tina-island/footer"></footer>
    `;
    formsByEndpoint = {
      '/tina-island/header': 'global',
      '/tina-island/post': 'post author',
      '/tina-island/footer': 'global',
    };
    fetchMock = vi.fn((endpoint: string) =>
      Promise.resolve(
        new Response(
          `<div data-tina-island="${endpoint}" data-tina-island-forms="${formsByEndpoint[endpoint]}">fresh</div>`,
          { headers: { 'Content-Type': 'text/html' } }
        )
      )
    );
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  function setup() {
    const store = initDataStore();
    store.seed('post', {});
    store.seed('global', {});
    initIslandRefresh(store, { debounceMs: 300 });
    return store;
  }

  async function flush(ms: number): Promise<string[]> {
    fetchMock.mockClear();
    await vi.advanceTimersByTimeAsync(ms);
    return fetchMock.mock.calls.map(([endpoint]) => endpoint).sort();
  }

  it('turns the burst of first updates into one pass over every island', async () => {
    const store = setup();
    store.set('post', { a: 1 });
    store.set('global', { a: 1 });
    store.set('post', { a: 2 });
    store.set('global', { a: 2 });

    expect(await flush(49)).toEqual([]);
    expect(await flush(1)).toEqual([
      '/tina-island/footer',
      '/tina-island/header',
      '/tina-island/post',
    ]);
    expect(await flush(1000)).toEqual([]);
  });

  it("learns each island's forms and then refreshes only the islands using a changed form", async () => {
    const store = setup();
    store.set('post', { a: 1 });
    await flush(50);
    expect(
      document.querySelector('header')!.getAttribute('data-tina-island-forms')
    ).toBe('global');

    store.set('post', { a: 2 });
    expect(await flush(300)).toEqual(['/tina-island/post']);

    store.set('global', { a: 1 });
    expect(await flush(50)).toEqual([
      '/tina-island/footer',
      '/tina-island/header',
    ]);
  });

  it('keeps refreshing an island whose endpoint lists no forms', async () => {
    formsByEndpoint['/tina-island/footer'] = '';
    fetchMock.mockImplementation((endpoint: string) =>
      Promise.resolve(
        new Response(
          endpoint === '/tina-island/footer'
            ? `<footer data-tina-island="${endpoint}">fresh</footer>`
            : `<div data-tina-island="${endpoint}" data-tina-island-forms="${formsByEndpoint[endpoint]}">fresh</div>`,
          { headers: { 'Content-Type': 'text/html' } }
        )
      )
    );
    const store = setup();
    store.set('global', { a: 1 });
    await flush(50);

    store.set('post', { a: 1 });
    expect(await flush(50)).toEqual([
      '/tina-island/footer',
      '/tina-island/post',
    ]);
  });

  it('ignores an updateData identical to the previous one for that form', async () => {
    setAdminOrigin('https://admin.test');
    setup();
    const send = (id: string, data: object) =>
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: 'updateData', id, data },
          origin: 'https://admin.test',
          source: window.parent,
        })
      );
    send('post', { title: 'a' });
    send('global', { theme: 'dark' });
    await flush(50);

    // The admin re-sends every open form on each keystroke.
    send('post', { title: 'ab' });
    send('global', { theme: 'dark' });
    expect(await flush(300)).toEqual(['/tina-island/post']);
  });

  it('debounces edits after the first pass', async () => {
    const store = setup();
    store.set('post', { a: 1 });
    await flush(50);

    store.set('post', { a: 2 });
    await vi.advanceTimersByTimeAsync(200);
    store.set('post', { a: 3 });
    expect(await flush(299)).toEqual([]);
    expect(await flush(1)).toEqual(['/tina-island/post']);
    expect(JSON.parse(fetchMock.mock.calls[0]![1].body).post).toEqual({ a: 3 });
  });
});

describe('primeIslands forms list', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('records the primed forms on the island', async () => {
    document.body.innerHTML = `<article data-tina-island="/tina-island/post"></article>`;
    const form = (id: string) =>
      `<div data-tina-form='${JSON.stringify({ id, query: 'q', variables: {}, data: {} })}' hidden></div>`;
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          new Response(
            form('post') +
              form('author') +
              '<article data-tina-island="/tina-island/post" data-tina-island-forms="post author"></article>',
            { headers: { 'Content-Type': 'text/html' } }
          )
        )
      )
    );

    await primeIslands();

    expect(
      document.querySelector('article')!.getAttribute('data-tina-island-forms')
    ).toBe('post author');
  });
});
