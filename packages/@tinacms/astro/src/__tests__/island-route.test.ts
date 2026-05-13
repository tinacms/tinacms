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
        })
      ),
    component: IslandStub,
    wrapper: { tag: 'article', className: 'prose' },
    propsFromData: (data) => ({ value: data }),
  },
});

function call(headers: Record<string, string>): Promise<Response> {
  const url = new URL('http://localhost/tina-island/post');
  const request = new Request(url, {
    method: 'POST',
    headers: { 'content-type': PREVIEW_CONTENT_TYPE, ...headers },
    body: '{}',
  });
  return Promise.resolve(
    route({ params: { name: 'post' }, request, url } as unknown as APIContext)
  ) as Promise<Response>;
}

describe('experimental_createIslandRoute', () => {
  it('renders the wrapped island region', async () => {
    const res = await call({});
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain(
      '<article class="prose" data-tina-island="/tina-island/post">'
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

  it('marks the first payload `data-tina-primary` so the bridge retry loop picks it up', async () => {
    // The single loader for this island has no explicit priority; the
    // first form still gets `data-tina-primary` so the bridge's
    // controller.primaryId path fires user-select-form on its retry
    // loop (selectPrimary's single-shot from JSON priority can race the
    // admin's form-registration).
    const res = await call({ [PRIME_HEADER]: '1' });
    const html = await res.text();
    const firstFormIdx = html.indexOf('data-tina-form=');
    const primaryIdx = html.indexOf('data-tina-primary');
    expect(firstFormIdx).toBeGreaterThan(-1);
    expect(primaryIdx).toBeGreaterThan(firstFormIdx);
    // The primary marker must land on the *first* payload div, not later
    // markup. The closing `>` of the first <div data-tina-form=...> is
    // the anchor.
    const firstDivEnd = html.indexOf('hidden></div>', firstFormIdx);
    expect(primaryIdx).toBeLessThan(firstDivEnd);
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
    const url = new URL('http://localhost/tina-island/nope');
    const res = (await route({
      params: { name: 'nope' },
      request: new Request(url, {
        method: 'POST',
        headers: { 'content-type': PREVIEW_CONTENT_TYPE },
        body: '{}',
      }),
      url,
    } as unknown as APIContext)) as Response;
    expect(res.status).toBe(404);
  });
});
