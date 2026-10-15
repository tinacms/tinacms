import { Readable } from 'node:stream';
import { describe, expect, it } from 'vitest';
import { definePlugin } from '../core/plugin';
import { MAX_REQUEST_BODY_BYTES } from '../core/request-body';
import { defineServerPlugin, publicOp } from '../server';
import { mountHandler as mountAstro } from './astro';
import { type TinaMiddleware, tinaMiddleware } from './express';
import { mountHandler as mountHono } from './hono';
import { mountHandler as mountNext } from './next';

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

  it('answers GET with 405 rather than leaving the method unexported', async () => {
    const { GET } = mountNext({ plugins });
    const response = await GET(new Request(`http://tina.local${ROUTE}`));
    expect(response.status).toBe(405);
  });
});

const chunksOf = (body: string | string[] | undefined): Buffer[] => {
  if (body === undefined) return [];
  const parts = Array.isArray(body) ? body : [body];
  return parts.map((part) => Buffer.from(part));
};

const nodeRequest = (init: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: string | string[];
  parsedBody?: unknown;
  encrypted?: boolean;
}) =>
  Object.assign(Readable.from(chunksOf(init.body)), {
    method: init.method ?? 'POST',
    url: init.url ?? ROUTE,
    headers: {
      host: 'tina.local',
      'content-type': 'application/json',
      ...init.headers,
    },
    socket: { encrypted: init.encrypted ?? false },
    ...(init.parsedBody === undefined ? {} : { body: init.parsedBody }),
  }) as unknown as MiddlewareRequest;

type MiddlewareRequest = Parameters<TinaMiddleware>[0];
type MiddlewareResponse = Parameters<TinaMiddleware>[1];

const runMiddleware = async (req: MiddlewareRequest) => {
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
  tinaMiddleware({ plugins })(
    req,
    recorder as unknown as MiddlewareResponse,
    (error) => {
      errors.push(error);
      settle();
    }
  );
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

  it('reads a body that an upstream parser already consumed', async () => {
    const { recorder } = await runMiddleware(
      nodeRequest({ parsedBody: { value: 'parsed' } })
    );
    expect(JSON.parse(recorder.body)).toEqual({ echoed: 'parsed' });
  });

  it('routes whether or not Express stripped the mount path', async () => {
    const { recorder } = await runMiddleware(
      nodeRequest({
        url: '/media/echo',
        body: JSON.stringify({ value: 'mounted' }),
      })
    );
    expect(JSON.parse(recorder.body)).toEqual({ echoed: 'mounted' });
  });

  it('refuses a body larger than the limit', async () => {
    const { recorder, errors } = await runMiddleware(
      nodeRequest({ body: ['a'.repeat(MAX_REQUEST_BODY_BYTES), 'a'] })
    );
    expect(errors).toEqual([]);
    expect(recorder.statusCode).toBe(413);
  });

  it('does not send a body on a GET, and reports the 405', async () => {
    const { recorder, errors } = await runMiddleware(
      nodeRequest({ method: 'GET', body: undefined })
    );
    expect(errors).toEqual([]);
    expect(recorder.statusCode).toBe(405);
  });
});
