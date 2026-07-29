import { describe, expect, it, vi } from 'vitest';
import { definePlugin } from '../core/plugin';
import {
  type Session,
  defineServerPlugin,
  protectedOp,
  publicOp,
  use,
} from '../server';
import { createRpcHandler } from './handler';

const sessionsByToken: Record<string, Session> = {
  'admin-token': { identity: { id: 'ada' }, roles: ['admin'] },
  'editor-token': { identity: { id: 'eli' }, roles: ['editor'] },
  'proto-token': { identity: { id: 'mal' }, roles: ['constructor'] },
};

const authPlugin = (rolePermissions?: (role: string) => Promise<string[]>) =>
  definePlugin({
    name: 'test-auth',
    provides: ['auth'],
    server: async () => ({
      default: defineServerPlugin({
        getSession: async (request: Request) => {
          const token = request.headers
            .get('authorization')
            ?.replace('Bearer ', '');
          return (token && sessionsByToken[token]) || null;
        },
        ...(rolePermissions ? { rolePermissions } : {}),
        whoami: async () => 'auth-op-result',
      }),
    }),
  });

const mediaPlugin = definePlugin({
  name: 'test-media',
  provides: ['media'],
  server: async () => ({
    default: defineServerPlugin({
      list: async (input: { dir: string }) => ({ items: [input.dir] }),
      health: publicOp(async () => ({ ok: true })),
      remove: protectedOp(
        { permission: 'media:delete' },
        async (input: { path: string }) => ({ removed: input.path })
      ),
      // This covers the in-process accessor between two server segments, inside a
      // dispatch.
      viaAuth: async () => (use('auth').whoami as () => Promise<unknown>)(),
      explode: async () => {
        throw new Error('secret internals');
      },
    }),
  }),
});

const workflowPlugin = definePlugin({
  name: 'editorial-workflow',
  requires: { permission: 'content:publish' },
  server: async () => ({
    default: defineServerPlugin({
      requestPublish: async () => 'queued',
    }),
  }),
});

const handler = createRpcHandler({
  plugins: [authPlugin(), mediaPlugin, workflowPlugin],
});

const post = (
  path: string,
  opts: { token?: string; body?: unknown; raw?: string } = {}
) =>
  new Request(`http://tina.local/api/tina${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}),
    },
    body:
      opts.raw ??
      (opts.body === undefined ? undefined : JSON.stringify(opts.body)),
  });

// Sec-Fetch-Site is a forbidden header name, so happy-dom refuses to put it on a real
// Request — which is the property the guard rests on: a page cannot forge it either.
// The handler reads only these four members, so a double states the header instead.
const postStatingFetchSite = (path: string, site: string): Request =>
  ({
    method: 'POST',
    url: `http://tina.local/api/tina${path}`,
    headers: {
      get: (name: string) =>
        ({ 'content-type': 'application/json', 'sec-fetch-site': site })[
          name.toLowerCase()
        ] ?? null,
    },
    text: async () => '',
  }) as unknown as Request;

describe('createRpcHandler', () => {
  it('serves a publicOp with no session', async () => {
    const response = await handler(post('/media/health'));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  it('rejects a bare op with no session — protected by default', async () => {
    const response = await handler(post('/media/list', { body: { dir: 'x' } }));
    expect(response.status).toBe(401);
  });

  it('dispatches a bare op for any authenticated session', async () => {
    const response = await handler(
      post('/media/list', { token: 'editor-token', body: { dir: 'uploads' } })
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ items: ['uploads'] });
  });

  it('denies a protectedOp to a role without the permission', async () => {
    const response = await handler(
      post('/media/remove', { token: 'editor-token', body: { path: 'a.png' } })
    );
    expect(response.status).toBe(403);
  });

  it("grants a protectedOp through admin's wildcard", async () => {
    const response = await handler(
      post('/media/remove', { token: 'admin-token', body: { path: 'a.png' } })
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ removed: 'a.png' });
  });

  it("honors the provider's rolePermissions over the defaults", async () => {
    const permissive = createRpcHandler({
      plugins: [
        authPlugin(async (role) => (role === 'editor' ? ['media:delete'] : [])),
        mediaPlugin,
      ],
    });
    const response = await permissive(
      post('/media/remove', { token: 'editor-token', body: { path: 'a.png' } })
    );
    expect(response.status).toBe(200);
  });

  it('gates every op of a plugin declaring `requires`', async () => {
    const denied = await handler(
      post('/editorial-workflow/requestPublish', { token: 'editor-token' })
    );
    expect(denied.status).toBe(403);
    const granted = await handler(
      post('/editorial-workflow/requestPublish', { token: 'admin-token' })
    );
    expect(granted.status).toBe(200);
    expect(await granted.json()).toBe('queued');
  });

  it('fails closed when no auth provider is installed', async () => {
    const authless = createRpcHandler({ plugins: [mediaPlugin] });
    expect((await authless(post('/media/list', { body: {} }))).status).toBe(
      401
    );
    expect((await authless(post('/media/health'))).status).toBe(200);
  });

  it('fails compose when rolePermissions is not callable', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const malformed = createRpcHandler({
      plugins: [
        definePlugin({
          name: 'malformed-auth',
          provides: ['auth'],
          server: async () => ({
            default: defineServerPlugin({
              getSession: async () => sessionsByToken['admin-token'],
              rolePermissions: { editor: ['media:delete'] } as never,
            }),
          }),
        }),
        mediaPlugin,
      ],
    });
    const response = await malformed(
      post('/media/list', { token: 'admin-token', body: { dir: 'x' } })
    );
    expect(response.status).toBe(500);
    expect((await response.json()).error.code).toBe('runtime-compose-failed');
    consoleError.mockRestore();
  });

  it('resolves use(capability) inside the auth transport hooks', async () => {
    const composingAuth = definePlugin({
      name: 'composing-auth',
      provides: ['auth'],
      server: async () => ({
        default: defineServerPlugin({
          getSession: async (request: Request) => {
            // A provider that composes a capability can read its peers during a
            // verification.
            await (use('media').health as () => Promise<unknown>)();
            return request.headers.get('authorization')
              ? { identity: { id: 'ada' }, roles: ['admin'] }
              : null;
          },
        }),
      }),
    });
    const composed = createRpcHandler({
      plugins: [composingAuth, mediaPlugin],
    });
    const response = await composed(
      post('/media/list', { token: 'admin-token', body: { dir: 'x' } })
    );
    expect(response.status).toBe(200);
  });

  it('resolves use(capability) inside a dispatched op', async () => {
    const response = await handler(
      post('/media/viaAuth', { token: 'editor-token' })
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toBe('auth-op-result');
  });

  it('never routes the auth transport hooks', async () => {
    const response = await handler(
      post('/auth/getSession', { token: 'admin-token' })
    );
    expect(response.status).toBe(404);
  });

  it('404s an unknown namespace or op', async () => {
    expect((await handler(post('/nope/list'))).status).toBe(404);
    expect(
      (await handler(post('/media/nope', { token: 'admin-token' }))).status
    ).toBe(404);
  });

  it('405s non-POST methods', async () => {
    const response = await handler(
      new Request('http://tina.local/api/tina/media/health')
    );
    expect(response.status).toBe(405);
  });

  it('415s a POST without a JSON content-type', async () => {
    const response = await handler(
      new Request('http://tina.local/api/tina/media/health', { method: 'POST' })
    );
    expect(response.status).toBe(415);
  });

  it('415s a safelisted content-type that only names json in a parameter', async () => {
    const response = await handler(
      new Request('http://tina.local/api/tina/media/health', {
        method: 'POST',
        headers: { 'content-type': 'text/plain; charset=application/json' },
      })
    );
    expect(response.status).toBe(415);
  });

  it('accepts application/json with a charset parameter', async () => {
    const response = await handler(
      new Request('http://tina.local/api/tina/media/health', {
        method: 'POST',
        headers: { 'content-type': 'application/json; charset=utf-8' },
      })
    );
    expect(response.status).toBe(200);
  });

  it('400s a non-JSON body', async () => {
    const response = await handler(
      post('/media/list', { token: 'admin-token', raw: 'not json' })
    );
    expect(response.status).toBe(400);
  });

  it('denies a role named after an Object.prototype member', async () => {
    const response = await handler(
      post('/media/remove', { token: 'proto-token', body: { path: 'a.png' } })
    );
    expect(response.status).toBe(403);
  });

  it('fails closed when the auth segment has no callable getSession', async () => {
    const hookless = createRpcHandler({
      plugins: [
        definePlugin({
          name: 'hookless-auth',
          provides: ['auth'],
          server: async () => ({
            default: defineServerPlugin({ whoami: async () => 'x' }),
          }),
        }),
        mediaPlugin,
      ],
    });
    const response = await hookless(
      post('/media/list', { token: 'admin-token', body: { dir: 'x' } })
    );
    expect(response.status).toBe(401);
  });

  it('500s a throwing getSession without leaking its error', async () => {
    const throwing = createRpcHandler({
      plugins: [
        definePlugin({
          name: 'throwing-auth',
          provides: ['auth'],
          server: async () => ({
            default: defineServerPlugin({
              getSession: async () => {
                throw new Error('secret provider detail');
              },
            }),
          }),
        }),
        mediaPlugin,
      ],
    });
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const response = await throwing(
      post('/media/list', { token: 'admin-token', body: { dir: 'x' } })
    );
    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain(
      'secret provider detail'
    );
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('retries composition after a failed compose instead of caching it', async () => {
    let attempts = 0;
    const flaky = definePlugin({
      name: 'flaky',
      server: async () => {
        attempts += 1;
        if (attempts === 1) throw new Error('transient import failure');
        return {
          default: defineServerPlugin({ ping: publicOp(async () => 'pong') }),
        };
      },
    });
    const flakyHandler = createRpcHandler({ plugins: [flaky] });
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const first = await flakyHandler(post('/flaky/ping'));
    expect(first.status).toBe(500);
    expect(JSON.stringify(await first.json())).not.toContain('transient');
    const second = await flakyHandler(post('/flaky/ping'));
    expect(second.status).toBe(200);
    consoleError.mockRestore();
  });

  it('500s a throwing op without leaking its error', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const response = await handler(
      post('/media/explode', { token: 'admin-token' })
    );
    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(JSON.stringify(payload)).not.toContain('secret internals');
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('403s a cross-site POST', async () => {
    const response = await handler(
      postStatingFetchSite('/media/health', 'cross-site')
    );
    expect(response.status).toBe(403);
  });

  it('serves a same-origin POST that states its relationship', async () => {
    const response = await handler(
      postStatingFetchSite('/media/health', 'same-origin')
    );
    expect(response.status).toBe(200);
  });
});

// The guards that need no runtime run before the runtime composes, so a request that
// never reaches an operation cannot make every plugin import and initialize.
describe('createRpcHandler composition', () => {
  const countingPlugin = (onInit: () => void) =>
    definePlugin({
      name: 'counting',
      provides: ['search'],
      onInit,
      server: async () => ({
        default: defineServerPlugin({ ping: publicOp(async () => 'pong') }),
      }),
    });

  it('does not compose the runtime for a request the guards refuse', async () => {
    const onInit = vi.fn();
    const handler = createRpcHandler({ plugins: [countingPlugin(onInit)] });
    await handler(new Request('http://tina.local/api/tina/search/ping'));
    await handler(
      new Request('http://tina.local/api/tina/search/ping', { method: 'POST' })
    );
    expect(onInit).not.toHaveBeenCalled();
    await handler(post('/search/ping'));
    expect(onInit).toHaveBeenCalledTimes(1);
  });

  it('runs every onDestroy when a handler is destroyed', async () => {
    const onDestroy = vi.fn();
    const handler = createRpcHandler({
      plugins: [
        definePlugin({
          name: 'counting',
          provides: ['search'],
          onDestroy,
          server: async () => ({
            default: defineServerPlugin({ ping: publicOp(async () => 'pong') }),
          }),
        }),
      ],
    });
    await handler(post('/search/ping'));
    await handler.destroy();
    expect(onDestroy).toHaveBeenCalledTimes(1);
  });

  it('holds a request that arrives mid-teardown until onDestroy finishes', async () => {
    const lifecycle: string[] = [];
    let onDestroyStarted: () => void = () => {};
    let releaseOnDestroy: () => void = () => {};
    const started = new Promise<void>((resolve) => {
      onDestroyStarted = resolve;
    });
    const released = new Promise<void>((resolve) => {
      releaseOnDestroy = resolve;
    });
    const handler = createRpcHandler({
      plugins: [
        definePlugin({
          name: 'counting',
          provides: ['search'],
          onInit: () => {
            lifecycle.push('init');
          },
          onDestroy: async () => {
            lifecycle.push('destroy-start');
            onDestroyStarted();
            await released;
            lifecycle.push('destroy-end');
          },
          server: async () => ({
            default: defineServerPlugin({ ping: publicOp(async () => 'pong') }),
          }),
        }),
      ],
    });
    await handler(post('/search/ping'));
    const teardown = handler.destroy();
    await started;
    // The destroy has cleared the cache, so this request composes again. It must not
    // run onInit while the onDestroy above is still running.
    const duringTeardown = handler(post('/search/ping'));
    // Long enough for an unserialised composition to reach its onInit.
    await new Promise((resolve) => setTimeout(resolve, 20));
    releaseOnDestroy();
    await teardown;
    expect((await duringTeardown).status).toBe(200);
    expect(lifecycle).toEqual(['init', 'destroy-start', 'destroy-end', 'init']);
  });

  it('logs a failing onDestroy instead of swallowing it', async () => {
    const cause = new Error('a handle stayed open');
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const handler = createRpcHandler({
      plugins: [
        definePlugin({
          name: 'counting',
          provides: ['search'],
          onDestroy: () => {
            throw cause;
          },
          server: async () => ({
            default: defineServerPlugin({ ping: publicOp(async () => 'pong') }),
          }),
        }),
      ],
    });
    await handler(post('/search/ping'));
    await expect(handler.destroy()).resolves.toBeUndefined();
    expect(consoleError).toHaveBeenCalledWith(
      '[tinacms] RPC plugin teardown failed:',
      cause
    );
    consoleError.mockRestore();
  });

  it('destroys nothing when no request ever composed the runtime', async () => {
    const onDestroy = vi.fn();
    const handler = createRpcHandler({
      plugins: [
        definePlugin({
          name: 'counting',
          provides: ['search'],
          onDestroy,
          server: async () => ({
            default: defineServerPlugin({ ping: publicOp(async () => 'pong') }),
          }),
        }),
      ],
    });
    await handler.destroy();
    expect(onDestroy).not.toHaveBeenCalled();
  });
});

// Without a mountPath the route is the last two segments, so any prefix reaches the
// operation. With one, the path has to be the mount and exactly those two.
describe('createRpcHandler mountPath', () => {
  const plugins = [mediaPlugin, authPlugin()];

  it('routes a prefixed path when no mountPath is set', async () => {
    const handler = createRpcHandler({ plugins });
    const response = await handler(post('/junk/media/health'));
    expect(response.status).toBe(200);
  });

  it('404s that same prefixed path when a mountPath is set', async () => {
    const handler = createRpcHandler({ plugins, mountPath: '/api/tina' });
    const response = await handler(post('/junk/media/health'));
    expect(response.status).toBe(404);
  });

  it('serves the exact mounted path', async () => {
    const handler = createRpcHandler({ plugins, mountPath: '/api/tina' });
    const response = await handler(post('/media/health'));
    expect(response.status).toBe(200);
  });
});
