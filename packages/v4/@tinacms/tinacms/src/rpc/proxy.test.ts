import { describe, expect, it } from 'vitest';
import { definePlugin } from '../core/plugin';
import { defineServerPlugin, publicOp } from '../server';
import { createRpcHandler } from './handler';
import { RpcError, createRpcClient } from './proxy';

// The exact pattern a real plugin uses: the ops record's type crosses to the client
// via `import type`-style inference — here directly, same TS project.
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
  // The handler is Web-standard, so it doubles as the fetch implementation.
  fetch: (input, init) => handler(new Request(input, init)),
});

describe('createRpcClient', () => {
  it('round-trips a typed call through the handler', async () => {
    const result = await client.search.query({ q: 'tina' });
    expect(result).toEqual({ hits: ['tina'] });
  });

  it('throws RpcError carrying the transport code and status', async () => {
    const rejection = client.search.reindex(undefined as never);
    await expect(rejection).rejects.toBeInstanceOf(RpcError);
    await expect(rejection).rejects.toMatchObject({
      status: 401,
      code: 'unauthenticated',
    });
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
