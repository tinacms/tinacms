import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { primeIslands } from './island-refresh';
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
