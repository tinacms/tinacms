import { hashFromQuery } from '@tinacms/bridge/metadata';
import { PREVIEW_CONTENT_TYPE, PRIME_HEADER } from '@tinacms/bridge/preview';
import type { RequestHandler } from '@sveltejs/kit';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import CalloutOverride from './fixtures/CalloutOverride.svelte';
import TinaIslandFixture from './fixtures/TinaIslandFixture.svelte';
import { requestWithMetadata } from '../data';
import { experimental_createIslandHandler } from '../experimental/island';

const query =
  'query Post($relativePath: String!) { post(relativePath: $relativePath) }';
const variables = { relativePath: 'hello.md' };
const id = hashFromQuery(JSON.stringify({ query, variables }));

function makeEvent(
  request: Request,
  name = 'post'
): Parameters<RequestHandler>[0] {
  return {
    request,
    locals: {},
    params: { name },
    url: new URL(request.url),
  } as Parameters<RequestHandler>[0];
}

describe('experimental_createIslandHandler', () => {
  it('renders the Tina overlay through a server component and primes its form', async () => {
    const handler = experimental_createIslandHandler({
      post: {
        component: CalloutOverride,
        wrapper: { tag: 'article', className: 'post' },
        fetch: async (event) => {
          const result = await requestWithMetadata(
            { data: { title: 'Published title' }, query, variables },
            event
          );
          return result.data;
        },
        propsFromData: (data) => ({
          title: (data as { title: string }).title,
          tone: 'primary',
        }),
      },
    });
    const request = new Request(
      'http://localhost/tina-island/post?slug=hello',
      {
        method: 'POST',
        body: JSON.stringify({ [id]: { title: 'Unsaved title' } }),
        headers: {
          'content-type': PREVIEW_CONTENT_TYPE,
          origin: 'http://localhost',
          [PRIME_HEADER]: '1',
        },
      }
    );

    const response = await handler(makeEvent(request));
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(html).toContain('data-tina-form=');
    expect(html).toContain('data-tina-island="/tina-island/post?slug=hello"');
    expect(html).toContain('data-tone="primary">Unsaved title</aside>');
    expect(html).not.toContain('Published title');
  });

  it('rejects requests that do not match the bridge request shape', async () => {
    const handler = experimental_createIslandHandler({});
    const response = await handler(
      makeEvent(new Request('http://localhost/tina-island/post'))
    );

    expect(response.status).toBe(405);
  });

  it('does not select inherited registry properties', async () => {
    const handler = experimental_createIslandHandler({});
    const request = new Request('http://localhost/tina-island/constructor', {
      method: 'POST',
      headers: {
        'content-type': PREVIEW_CONTENT_TYPE,
        origin: 'http://localhost',
      },
      body: '{}',
    });
    const response = await handler(makeEvent(request, 'constructor'));

    expect(response.status).toBe(404);
  });

  it('rejects requests from another origin', async () => {
    const handler = experimental_createIslandHandler({});
    const request = new Request('http://localhost/tina-island/post', {
      method: 'POST',
      headers: {
        'content-type': PREVIEW_CONTENT_TYPE,
        origin: 'https://other.example',
      },
      body: '{}',
    });
    const response = await handler(makeEvent(request));

    expect(response.status).toBe(403);
  });

  it('rejects malformed preview bodies', async () => {
    const handler = experimental_createIslandHandler({});
    const request = new Request('http://localhost/tina-island/post', {
      method: 'POST',
      headers: {
        'content-type': PREVIEW_CONTENT_TYPE,
        origin: 'http://localhost',
      },
      body: '[]',
    });
    const response = await handler(makeEvent(request));

    expect(response.status).toBe(400);
  });

  it('rejects oversized preview bodies', async () => {
    const handler = experimental_createIslandHandler({});
    const request = new Request('http://localhost/tina-island/post', {
      method: 'POST',
      headers: {
        'content-type': PREVIEW_CONTENT_TYPE,
        origin: 'http://localhost',
      },
      body: JSON.stringify({ data: 'x'.repeat(1_000_001) }),
    });
    const response = await handler(makeEvent(request));

    expect(response.status).toBe(413);
  });

  it('renders the island wrapper with encoded parameters', () => {
    const { body } = render(TinaIslandFixture);

    expect(body).toContain(
      'data-tina-island="/preview/tina-island/post?slug=hello+world&amp;version=2"'
    );
    expect(body).toContain('data-tina-island-primary');
    expect(body).toContain('<p>Island content</p>');
  });
});
