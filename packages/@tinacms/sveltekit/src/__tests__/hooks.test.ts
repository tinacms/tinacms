import { hashFromQuery } from '@tinacms/bridge/metadata';
import type { Handle } from '@sveltejs/kit/hooks';
import { describe, expect, it, vi } from 'vitest';
import { requestWithMetadata } from '../data';
import { EDIT_COOKIE } from '../is-edit-mode';
import { tinaHandle } from '../hooks';

function makeEvent(request: Request) {
  return {
    request,
    locals: {},
  } as Parameters<Handle>[0]['event'];
}

function editRequest(path = '/posts/hello') {
  return new Request(`https://site.test${path}`, {
    headers: {
      'sec-fetch-dest': 'iframe',
      referer: 'https://site.test/admin/index.html',
    },
  });
}

describe('tinaHandle', () => {
  it('injects sorted forms across chunk boundaries and sets the edit cookie', async () => {
    const event = makeEvent(editRequest());
    const primary = {
      query: 'query Post { post { title } }',
      variables: {},
    };
    const secondary = {
      query: 'query Global { global { title } }',
      variables: {},
    };
    let transformed = '';
    const resolve: Parameters<Handle>[0]['resolve'] = async (
      _event,
      options
    ) => {
      await requestWithMetadata(
        { data: { title: 'Post' }, ...secondary },
        event
      );
      await requestWithMetadata(
        { data: { title: 'Main post' }, ...primary },
        event,
        { priority: 'primary' }
      );

      for (const [html, done] of [
        ['<html><hea', false],
        ['d>Meta</he', false],
        ['ad><body>Content</body></html>', true],
      ] as const) {
        transformed += options?.transformPageChunk?.({ html, done }) ?? '';
      }
      return new Response(transformed, {
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'content-length': String(transformed.length),
        },
      });
    };

    const response = await tinaHandle({ event, resolve });
    const html = await response.text();
    const primaryId = hashFromQuery(JSON.stringify(primary));
    const secondaryId = hashFromQuery(JSON.stringify(secondary));

    expect(html).toContain('</head><body>Content</body></html>');
    expect(html.indexOf(primaryId)).toBeLessThan(html.indexOf(secondaryId));
    expect(html).toContain('data-tina-primary');
    expect(html).not.toContain('/admin/bridge.js');
    // A <div> inside <head> makes the parser close the head early, moving later head
    // nodes into <body> and breaking Svelte's head hydration in the editor.
    const head = html.slice(0, html.indexOf('</head>'));
    expect(head).not.toMatch(/<div\b/);
    expect(head).toContain('<template data-tina-form=');
    expect(response.headers.get('content-length')).toBeNull();
    expect(response.headers.get('set-cookie')).toContain(`${EDIT_COOKIE}=1`);
  });

  it('injects right before </head> when the head contains non-ASCII text', async () => {
    const event = makeEvent(editRequest());
    const resolve: Parameters<Handle>[0]['resolve'] = async (
      _event,
      options
    ) => {
      await requestWithMetadata(
        {
          data: { title: 'Post' },
          query: 'query Post { post { title } }',
          variables: {},
        },
        event
      );
      const html = options?.transformPageChunk?.({
        html: '<html><head><title>İstanbul ẞtraße</title></HEAD><body>Post</body></html>',
        done: true,
      });
      return new Response(html ?? '', {
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    };

    const html = await (await tinaHandle({ event, resolve })).text();

    expect(html).toContain('<title>İstanbul ẞtraße</title><template');
    expect(html).toContain('</template></HEAD><body>Post</body>');
  });

  it('returns ordinary responses untouched and does not request a transform', async () => {
    const event = makeEvent(new Request('https://site.test/posts/hello'));
    const response = new Response('ordinary page', {
      headers: { 'content-type': 'text/html' },
    });
    const resolve = vi.fn(async () => response);

    const result = await tinaHandle({ event, resolve });

    expect(result).toBe(response);
    expect(resolve).toHaveBeenCalledWith(event);
  });

  it('keeps form payloads isolated across concurrent requests', async () => {
    const render = async (title: string) => {
      const event = makeEvent(editRequest());
      const resolve: Parameters<Handle>[0]['resolve'] = async (
        _event,
        options
      ) => {
        await requestWithMetadata(
          {
            data: { title },
            query: 'query Post { post { title } }',
            variables: {},
          },
          event
        );
        const html = options?.transformPageChunk?.({
          html: '<html><head></head><body>Post</body></html>',
          done: true,
        });
        return new Response(html ?? '', {
          headers: { 'content-type': 'text/html; charset=utf-8' },
        });
      };

      return tinaHandle({ event, resolve }).then((response) => response.text());
    };

    const [first, second] = await Promise.all([
      render('First title'),
      render('Second title'),
    ]);

    expect(first).toContain('First title');
    expect(first).not.toContain('Second title');
    expect(second).toContain('Second title');
    expect(second).not.toContain('First title');
  });

  it('streams the editor injection before the HTML response is complete', async () => {
    const event = makeEvent(editRequest());
    const encoder = new TextEncoder();
    let firstChunkSent = false;
    const resolve: Parameters<Handle>[0]['resolve'] = async (
      _event,
      options
    ) => {
      await requestWithMetadata(
        {
          data: { title: 'Streamed title' },
          query: 'query Post { post { title } }',
          variables: {},
        },
        event
      );

      const stream = new ReadableStream<Uint8Array>({
        pull(controller) {
          if (firstChunkSent) return new Promise(() => {});
          firstChunkSent = true;
          const html = options?.transformPageChunk?.({
            html: '<html><head></head><body>First chunk',
            done: false,
          });
          controller.enqueue(encoder.encode(html ?? ''));
        },
      });

      return new Response(stream, {
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    };

    const response = await tinaHandle({ event, resolve });
    const reader = response.body?.getReader();
    if (!reader) throw new Error('expected an HTML response stream');

    const firstChunk = await reader.read();
    expect(firstChunk.done).toBe(false);
    const html = new TextDecoder().decode(firstChunk.value);
    expect(html).toContain('data-tina-form=');
    expect(html).toContain('<body>First chunk');
    await reader.cancel();
  });

  it('keeps non-HTML response bodies and lengths intact in edit mode', async () => {
    const event = makeEvent(editRequest('/api/data'));
    const resolve: Parameters<Handle>[0]['resolve'] = async () =>
      new Response('{"ok":true}', {
        headers: {
          'content-type': 'application/json',
          'content-length': '11',
        },
      });

    const response = await tinaHandle({ event, resolve });

    expect(await response.text()).toBe('{"ok":true}');
    expect(response.headers.get('content-length')).toBe('11');
    expect(response.headers.get('set-cookie')).toContain(`${EDIT_COOKIE}=1`);
  });
});
