import { hashFromQuery } from '@tinacms/bridge/metadata';
import { PREVIEW_CONTENT_TYPE, PRIME_HEADER } from '@tinacms/bridge/preview';
import type { APIContext } from 'astro';
import { describe, expect, it } from 'vitest';
import { requestWithMetadata } from '../data';
import { experimental_createIslandRoute } from '../island-route';
import IslandStub from './IslandStub.astro';

const route = experimental_createIslandRoute({
  post: {
    fetch: () =>
      requestWithMetadata(
        Promise.resolve({
          data: { post: { title: 'Hi' } },
          query: 'query Post',
          variables: { relativePath: 'hello.md' },
        }),
        { priority: 'primary' }
      ),
    component: IslandStub,
    wrapper: { tag: 'article', className: 'prose' },
    propsFromData: (data) => ({ value: data }),
  },
  global: {
    fetch: () =>
      requestWithMetadata(
        Promise.resolve({
          data: { config: { theme: 'dark' } },
          query: 'query Global',
          variables: {},
        })
      ),
    component: IslandStub,
    wrapper: { tag: 'header' },
    propsFromData: (data) => ({ value: data }),
  },
});

function call(
  headers: Record<string, string>,
  name = 'post'
): Promise<Response> {
  const url = new URL(`http://localhost/tina-island/${name}`);
  const request = new Request(url, {
    method: 'POST',
    headers: {
      'content-type': PREVIEW_CONTENT_TYPE,
      origin: url.origin,
      ...headers,
    },
    body: '{}',
  });
  return Promise.resolve(
    route({ params: { name }, request, url } as unknown as APIContext)
  ) as Promise<Response>;
}

describe('experimental_createIslandRoute', () => {
  it('renders the wrapped island region', async () => {
    const res = await call({});
    expect(res.status).toBe(200);
    const html = await res.text();
    const id = hashFromQuery(
      JSON.stringify({
        query: 'query Post',
        variables: { relativePath: 'hello.md' },
      })
    );
    expect(html).toContain(
      `<article class="prose" data-tina-island="/tina-island/post" data-tina-island-forms="${id}">`
    );
    expect(html).toContain('stub');
    expect(html).not.toContain('data-tina-form=');
  });

  it('prepends the collected form payloads on a primed request', async () => {
    const res = await call({ [PRIME_HEADER]: '1' });
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('data-tina-form=');
    // The payload carries the query/variables the loader used.
    expect(html).toContain('query Post');
    expect(html).toContain('hello.md');
    // The region HTML still follows the payload divs.
    expect(html).toContain('data-tina-island="/tina-island/post"');
  });

  it('emits `data-tina-primary` only on payloads that set `priority: "primary"`', async () => {
    // The `post` loader passes `{ priority: 'primary' }`; the `global`
    // loader does not. Each island route call renders its own forms
    // independently, so a positional marker (`i === 0`) would tag the
    // first form of *every* island — on a page that primes
    // `[page, global-header, global-footer]` the bridge would see three
    // competing primaries and the first in DOM order (usually a layout
    // global) would win the retry loop.
    const postHtml = await (await call({ [PRIME_HEADER]: '1' }, 'post')).text();
    expect(postHtml).toContain('data-tina-form=');
    expect(postHtml).toContain('data-tina-primary');

    const globalHtml = await (
      await call({ [PRIME_HEADER]: '1' }, 'global')
    ).text();
    expect(globalHtml).toContain('data-tina-form=');
    expect(globalHtml).not.toContain('data-tina-primary');
  });

  it('rejects non-preview requests', async () => {
    const url = new URL('http://localhost/tina-island/post');
    const res = (await route({
      params: { name: 'post' },
      request: new Request(url, { method: 'POST' }),
      url,
    } as unknown as APIContext)) as Response;
    expect(res.status).toBe(404);
  });

  it('404s an unknown island', async () => {
    const res = await call({}, 'nope');
    expect(res.status).toBe(404);
    expect(await res.text()).toBe('Not Found');
  });

  it('404s names inherited from Object.prototype', async () => {
    for (const name of ['constructor', 'toString', '__proto__']) {
      expect((await call({}, name)).status).toBe(404);
    }
  });

  it('rejects a cross-site request', async () => {
    const res = await call({
      origin: 'https://evil.example',
      'sec-fetch-site': 'cross-site',
    });
    expect(res.status).toBe(403);
  });

  it('rejects a body that is not a JSON object', async () => {
    const url = new URL('http://localhost/tina-island/post');
    const res = (await route({
      params: { name: 'post' },
      request: new Request(url, {
        method: 'POST',
        headers: {
          'content-type': PREVIEW_CONTENT_TYPE,
          origin: url.origin,
        },
        body: '[]',
      }),
      url,
    } as unknown as APIContext)) as Response;
    expect(res.status).toBe(400);
  });

  it('answers a failing loader with a generic 500', async () => {
    const failing = experimental_createIslandRoute({
      post: {
        fetch: () => Promise.reject(new Error('backend down')),
        component: IslandStub,
        wrapper: { tag: 'article' },
        propsFromData: () => ({}),
      },
    });
    const url = new URL('http://localhost/tina-island/post');
    const res = (await failing({
      params: { name: 'post' },
      request: new Request(url, {
        method: 'POST',
        headers: {
          'content-type': PREVIEW_CONTENT_TYPE,
          origin: url.origin,
        },
        body: '{}',
      }),
      url,
    } as unknown as APIContext)) as Response;
    expect(res.status).toBe(500);
    expect(await res.text()).toBe('Island render failed');
  });

  it('throws on an invalid registry', () => {
    const island = {
      fetch: async () => ({}),
      component: IslandStub,
      propsFromData: () => ({}),
    };
    expect(() =>
      experimental_createIslandRoute({
        'not/a/segment': { ...island, wrapper: { tag: 'div' } },
      })
    ).toThrow(TypeError);
    expect(() =>
      experimental_createIslandRoute({
        post: { ...island, wrapper: { tag: 'img' } },
      })
    ).toThrow(TypeError);
  });
});
