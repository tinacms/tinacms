// Every adapter mounts the same RpcHandler into the server that the project already
// runs. Next, Astro, and Hono hand over a Web Request and take back a Web Response, so
// their tests assert the wiring. Express speaks node streams, so its conversion is the
// part with behaviour worth covering.

import { Readable } from 'node:stream';
import { describe, expect, it } from 'vitest';
import { definePlugin } from '../core/plugin';
import { defineServerPlugin, publicOp } from '../server';
import { mountHandler as mountAstro } from './astro';
import { tinaMiddleware } from './express';
import { mountHandler as mountHono } from './hono';
import { mountHandler as mountNext } from './next';

// One public op, so these tests cover the transport and not the authorization. The
// dispatch skips the session check for a publicOp, which handler.test.ts covers.
const plugins = [
  definePlugin({
    name: 'test-media',
    provides: ['media'],
    server: async () => ({
      default: defineServerPlugin({
        echo: publicOp(async (input: { value: string }) => ({
          echoed: input.value,
        })),
      }),
    }),
  }),
];

const ROUTE = '/api/tina/media/echo';

const jsonRequest = (body: unknown) =>
  new Request(`http://tina.local${ROUTE}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('the Web-standard adapters', () => {
  it('routes a Next.js route handler to the op', async () => {
    const { POST } = mountNext({ plugins });
    const response = await POST(jsonRequest({ value: 'next' }));
    expect(await response.json()).toEqual({ echoed: 'next' });
  });

  it('routes an Astro endpoint to the op', async () => {
    const { POST } = mountAstro({ plugins });
    const response = await POST({ request: jsonRequest({ value: 'astro' }) });
    expect(await response.json()).toEqual({ echoed: 'astro' });
  });

  it('routes a Hono handler to the op through c.req.raw', async () => {
    const handler = mountHono({ plugins });
    const response = await handler({
      req: { raw: jsonRequest({ value: 'hono' }) },
    });
    expect(await response.json()).toEqual({ echoed: 'hono' });
  });

  // Operations are POST. A browser that opens the route gets the 405 that names the
  // problem, and not the 404 a framework returns for a method with no export.
  it('answers GET with 405 rather than leaving the method unexported', async () => {
    const { GET } = mountNext({ plugins });
    const response = await GET(new Request(`http://tina.local${ROUTE}`));
    expect(response.status).toBe(405);
  });
});

// A stand-in for the node request. Express extends IncomingMessage, which is a Readable,
// so a Readable carrying the same members is what the middleware sees.
const nodeRequest = (init: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: string;
  parsedBody?: unknown;
  encrypted?: boolean;
}) =>
  Object.assign(Readable.from(init.body ? [Buffer.from(init.body)] : []), {
    method: init.method ?? 'POST',
    url: init.url ?? ROUTE,
    headers: {
      host: 'tina.local',
      'content-type': 'application/json',
      ...init.headers,
    },
    socket: { encrypted: init.encrypted ?? false },
    ...(init.parsedBody === undefined ? {} : { body: init.parsedBody }),
  }) as never;

// The middleware returns before it has answered, because Express ignores a returned
// promise. "The request is done" therefore means `end` ran, or `next` got an error.
const runMiddleware = async (req: never) => {
  const headers: Record<string, string | string[]> = {};
  const errors: unknown[] = [];
  let settle: () => void = () => {};
  const done = new Promise<void>((resolve) => {
    settle = resolve;
  });
  const recorder = {
    statusCode: 0,
    body: '',
    headers,
    setHeader(name: string, value: string | string[]) {
      headers[name.toLowerCase()] = value;
    },
    end(chunk?: Buffer) {
      recorder.body = chunk?.toString() ?? '';
      settle();
    },
  };
  tinaMiddleware({ plugins })(req, recorder as never, (error) => {
    errors.push(error);
    settle();
  });
  await done;
  return { recorder, errors };
};

describe('the Express adapter', () => {
  it('converts a node request into a Request and answers on the node response', async () => {
    const { recorder } = await runMiddleware(
      nodeRequest({ body: JSON.stringify({ value: 'express' }) })
    );
    expect(recorder.statusCode).toBe(200);
    expect(JSON.parse(recorder.body)).toEqual({ echoed: 'express' });
    expect(recorder.headers['content-type']).toMatch(/application\/json/);
  });

  // express.json() upstream drains the socket and leaves the parsed value on req.body.
  // Reading the stream again yields nothing, so the op would have seen no input.
  it('reads a body that an upstream parser already consumed', async () => {
    const { recorder } = await runMiddleware(
      nodeRequest({ parsedBody: { value: 'parsed' } })
    );
    expect(JSON.parse(recorder.body)).toEqual({ echoed: 'parsed' });
  });

  // Express strips the mount path from `url` when the middleware is mounted with
  // app.use('/api/tina', …). The dispatch reads the last two segments, so both forms
  // must reach the same op.
  it('routes whether or not Express stripped the mount path', async () => {
    const { recorder } = await runMiddleware(
      nodeRequest({
        url: '/media/echo',
        body: JSON.stringify({ value: 'mounted' }),
      })
    );
    expect(JSON.parse(recorder.body)).toEqual({ echoed: 'mounted' });
  });

  it('does not send a body on a GET, and reports the 405', async () => {
    // A GET Request may not carry a body; constructing one throws. That throw would
    // reach `next` instead of the dispatch.
    const { recorder, errors } = await runMiddleware(
      nodeRequest({ method: 'GET', body: undefined })
    );
    expect(errors).toEqual([]);
    expect(recorder.statusCode).toBe(405);
  });
});
