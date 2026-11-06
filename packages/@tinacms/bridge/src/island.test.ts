// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import type { CollectedForm } from './form-payload';
import {
  type IslandRender,
  type IslandWrapper,
  assertValidIslands,
  handleIslandRequest,
} from './island';
import { PREVIEW_CONTENT_TYPE, PRIME_HEADER, readOverlay } from './preview';

interface TestIsland {
  wrapper: IslandWrapper;
  forms?: CollectedForm[];
}

const islands: Record<string, TestIsland> = {
  post: {
    wrapper: { tag: 'article', className: 'prose "x"' },
    forms: [
      { id: 'global', query: 'query Global', variables: {}, data: {} },
      {
        id: 'post',
        query: 'query Post',
        variables: { relativePath: 'hello.md' },
        data: {},
        priority: 'primary',
      },
    ],
  },
  header: { wrapper: { tag: 'header' } },
};

function islandRequest(
  url = 'http://site.test/tina-island/post?slug=a&b=<c>',
  init: { body?: BodyInit | null; headers?: Record<string, string> } = {}
): Request {
  return new Request(url, {
    method: 'POST',
    body: init.body === undefined ? '{}' : init.body,
    headers: {
      'content-type': PREVIEW_CONTENT_TYPE,
      origin: 'http://site.test',
      ...init.headers,
    },
    // Node requires this for a streamed body.
    ...({ duplex: 'half' } as object),
  });
}

function handle(
  request: Request,
  name: string | undefined = 'post',
  render: (island: TestIsland) => Promise<IslandRender> = async (island) => ({
    html: '<p>content</p>',
    forms: island.forms ?? [],
  })
): Promise<Response> {
  return handleIslandRequest({ request, name, islands, render });
}

function streamOf(bytes: number): ReadableStream<Uint8Array> {
  const chunk = new TextEncoder().encode('x'.repeat(100_000));
  let sent = 0;
  return new ReadableStream({
    pull(controller) {
      if (sent >= bytes) {
        controller.close();
        return;
      }
      sent += chunk.byteLength;
      controller.enqueue(chunk);
    },
  });
}

describe('assertValidIslands', () => {
  it('accepts path-segment names and non-void wrappers', () => {
    expect(() => assertValidIslands(islands)).not.toThrow();
  });

  it.each(['post_body', '2col', 'hero.v2', 'Post-Body', 'café'])(
    'accepts the island name %j',
    (name) => {
      expect(() =>
        assertValidIslands({ [name]: { wrapper: { tag: 'div' } } })
      ).not.toThrow();
    }
  );

  it.each([
    '',
    '.',
    '..',
    'post/x',
    '../x',
    'post\\x',
    'po st',
    'post?x',
    'post#x',
    '50%',
    'post\n',
  ])('rejects the island name %j', (name) => {
    expect(() =>
      assertValidIslands({ [name]: { wrapper: { tag: 'div' } } })
    ).toThrow(TypeError);
  });

  it.each(['img', 'IMG', 'br', 'div onclick', 'x>'])(
    'rejects the wrapper tag %j',
    (tag) => {
      expect(() => assertValidIslands({ post: { wrapper: { tag } } })).toThrow(
        TypeError
      );
    }
  );
});

describe('handleIslandRequest', () => {
  it('renders the island inside its escaped wrapper', async () => {
    const response = await handle(islandRequest());

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe(
      'text/html; charset=utf-8'
    );
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(await response.text()).toBe(
      '<article class="prose &quot;x&quot;" data-tina-island="/tina-island/post?slug=a&amp;b=%3Cc%3E" data-tina-island-forms="global post">' +
        '<p>content</p></article>'
    );
  });

  it('lists each form the island used once, and omits the list without forms', async () => {
    const form = { id: 'a"b', query: 'q', variables: {}, data: {} };
    const listed = await (
      await handle(islandRequest(), 'post', async () => ({
        html: '',
        forms: [form, form],
      }))
    ).text();
    expect(listed).toContain('data-tina-island-forms="a&quot;b">');

    const unlisted = await (
      await handle(islandRequest(), 'post', async () => ({
        html: '',
        forms: [],
      }))
    ).text();
    expect(unlisted).not.toContain('data-tina-island-forms');
  });

  it('prepends form payloads on a prime request, primary only when asserted', async () => {
    const html = await (
      await handle(
        islandRequest(undefined, { headers: { [PRIME_HEADER]: '1' } })
      )
    ).text();

    const payloadEnd = html.indexOf('<article');
    const payloads = html.slice(0, payloadEnd);
    expect(payloads.match(/data-tina-form=/g)).toHaveLength(2);
    expect(payloads.match(/data-tina-primary/g)).toHaveLength(1);
    expect(payloads.indexOf('query Post')).toBeLessThan(
      payloads.indexOf('query Global')
    );

    const header = await (
      await handle(
        islandRequest('http://site.test/tina-island/header', {
          headers: { [PRIME_HEADER]: '1' },
        }),
        'header'
      )
    ).text();
    expect(header).toBe(
      '<header data-tina-island="/tina-island/header"><p>content</p></header>'
    );
  });

  it('leaves the request body readable for the adapter', async () => {
    const render = vi.fn(async () => ({
      html: String(await readOverlay<string>(request, 'post')),
      forms: [],
    }));
    const request = islandRequest(undefined, {
      body: JSON.stringify({ post: 'unsaved' }),
    });

    const html = await (await handle(request, 'post', render)).text();

    expect(render).toHaveBeenCalledWith(islands.post);
    expect(html).toContain('>unsaved</article>');
  });

  it('answers a failed render with a generic 500', async () => {
    const response = await handle(islandRequest(), 'post', async () => {
      throw new Error('secret detail');
    });

    expect(response.status).toBe(500);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.text()).toBe('Island render failed');
  });

  it.each([undefined, '', 'missing', 'constructor', '__proto__', 'toString'])(
    'answers an unregistered island name %j with 404',
    async (name) => {
      const render = vi.fn();
      const response = await handleIslandRequest({
        request: islandRequest(),
        name,
        islands,
        render,
      });

      expect(response.status).toBe(404);
      expect(await response.text()).toBe('Not Found');
      expect(render).not.toHaveBeenCalled();
    }
  );

  it('rejects anything but POST', async () => {
    const response = await handle(
      new Request('http://site.test/tina-island/post')
    );
    expect(response.status).toBe(405);
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('rejects other content types', async () => {
    for (const contentType of [
      'application/json',
      `x-${PREVIEW_CONTENT_TYPE}`,
    ]) {
      const response = await handle(
        islandRequest(undefined, { headers: { 'content-type': contentType } })
      );
      expect(response.status).toBe(404);
    }
  });

  it('accepts the preview content type with parameters and any casing', async () => {
    const response = await handle(
      islandRequest(undefined, {
        headers: {
          'content-type': `${PREVIEW_CONTENT_TYPE.toUpperCase()}; charset=utf-8`,
        },
      })
    );
    expect(response.status).toBe(200);
  });

  it('rejects cross-site fetch metadata, even when Origin matches', async () => {
    const response = await handle(
      islandRequest(undefined, { headers: { 'sec-fetch-site': 'cross-site' } })
    );
    expect(response.status).toBe(403);
  });

  it.each(['same-origin', 'same-site', 'none'])(
    'accepts fetch metadata %j',
    async (fetchSite) => {
      const response = await handle(
        islandRequest(undefined, { headers: { 'sec-fetch-site': fetchSite } })
      );
      expect(response.status).toBe(200);
    }
  );

  it('accepts a request without Origin or fetch metadata (non-browser clients)', async () => {
    const bare = new Request('http://site.test/tina-island/post', {
      method: 'POST',
      body: '{}',
      headers: { 'content-type': PREVIEW_CONTENT_TYPE },
    });
    expect((await handle(bare)).status).toBe(200);
  });

  it('accepts an Origin that differs from the URL the server sees', async () => {
    // e.g. a TLS-terminating proxy: the browser used https://site.test, the
    // server was handed http://localhost:4321.
    const response = await handle(
      islandRequest('http://localhost:4321/tina-island/post', {
        headers: { origin: 'https://site.test' },
      })
    );
    expect(response.status).toBe(200);
  });

  it.each(['[]', 'null', '"text"', '42', '{not json', ''])(
    'rejects the body %j',
    async (body) => {
      const response = await handle(islandRequest(undefined, { body }));
      expect(response.status).toBe(400);
    }
  );

  it('rejects a request without a body', async () => {
    const response = await handle(islandRequest(undefined, { body: null }));
    expect(response.status).toBe(400);
  });

  it('rejects a body over 1 MB', async () => {
    const response = await handle(
      islandRequest(undefined, {
        body: JSON.stringify({ data: 'x'.repeat(1_000_001) }),
      })
    );
    expect(response.status).toBe(413);
  });

  it('stops reading a streamed body once it passes 1 MB', async () => {
    const response = await handle(
      islandRequest(undefined, { body: streamOf(50_000_000) })
    );
    expect(response.status).toBe(413);
  });
});
