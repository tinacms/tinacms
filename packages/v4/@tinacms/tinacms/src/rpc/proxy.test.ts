import { describe, expect, it } from 'vitest';
import { definePlugin } from '../core/plugin';
import { defineServerPlugin, publicOp } from '../server';
import { createRpcHandler } from './handler';
import { RpcError, createRpcClient } from './proxy';

const searchOps = defineServerPlugin({
  query: publicOp(async (input: { q: string }) => ({ hits: [input.q] })),
  reindex: async () => ({ started: true }),
});

const searchPlugin = definePlugin({
  name: 'test-search',
  provides: ['search'],
  server: async () => ({ default: searchOps }),
});

const handler = createRpcHandler({ plugins: [searchPlugin] });

const client = createRpcClient<{ search: typeof searchOps }>({
  url: 'http://tina.local/api/tina',
  fetch: (input, init) => handler(new Request(input, init)),
});

describe('createRpcClient', () => {
  it('round-trips a typed call through the handler', async () => {
    const result = await client.search.query({ q: 'tina' });
    expect(result).toEqual({ hits: ['tina'] });
  });

  it('throws RpcError carrying the transport code and status', async () => {
    const rejection = client.search.reindex(undefined);
    await expect(rejection).rejects.toBeInstanceOf(RpcError);
    await expect(rejection).rejects.toMatchObject({
      status: 401,
      code: 'unauthenticated',
    });
  });

  it('is not thenable and yields nothing for symbol keys', async () => {
    expect((client as unknown as Record<string, unknown>).then).toBeUndefined();
    expect(
      (client.search as unknown as Record<string, unknown>).then
    ).toBeUndefined();
    expect(client.search).toBeDefined();
    expect(
      (client.search as unknown as Record<symbol, unknown>)[Symbol.toStringTag]
    ).toBeUndefined();
  });

  it('attaches the bearer token from getToken', async () => {
    let seenAuthorization: string | null = null;
    const spying = createRpcClient<{ search: typeof searchOps }>({
      url: 'http://tina.local/api/tina',
      getToken: () => 'session-token',
      fetch: (input, init) => {
        const request = new Request(input, init);
        seenAuthorization = request.headers.get('authorization');
        return handler(request);
      },
    });
    await spying.search.query({ q: 'x' });
    expect(seenAuthorization).toBe('Bearer session-token');
  });
});
