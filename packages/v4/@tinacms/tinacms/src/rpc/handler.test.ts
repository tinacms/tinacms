import { describe, expect, it, vi } from 'vitest';
import type { ContentSaveInput } from '../core/content/contract';
import { defineHook, defineHooksPlugin } from '../core/form/hooks';
import { definePlugin } from '../core/plugin';
import type { HookRef } from '../core/schema/types';
import {
  type ServerFormHooks,
  type Session,
  defineServerHook,
  defineServerPlugin,
  protectedOp,
  publicOp,
  reject,
  toUserId,
  use,
} from '../server';
import { createRpcHandler } from './handler';

const sessionsByToken: Record<string, Session> = Object.assign(
  Object.create(null),
  {
    'admin-token': { identity: { id: toUserId('ada') }, roles: ['admin'] },
    'editor-token': { identity: { id: toUserId('eli') }, roles: ['editor'] },
    'proto-token': {
      identity: { id: toUserId('mal') },
      roles: ['constructor'],
    },
  }
);

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
            await (use('media').health as () => Promise<unknown>)();
            return request.headers.get('authorization')
              ? { identity: { id: toUserId('ada') }, roles: ['admin'] }
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

  it('routes every namespace of a multi-singleton plugin to its one segment', async () => {
    const onInit = vi.fn();
    const cloud = createRpcHandler({
      plugins: [
        definePlugin({
          name: 'tina:cloud',
          provides: ['auth', 'media'],
          onInit,
          server: async () => ({
            default: defineServerPlugin({
              getSession: async () => sessionsByToken['editor-token'],
              whoami: async () => 'cloud',
              list: async () => ({ items: [] }),
            }),
          }),
        }),
      ],
    });
    expect((await cloud(post('/auth/whoami'))).status).toBe(200);
    expect(await (await cloud(post('/media/list'))).json()).toEqual({
      items: [],
    });
    expect((await cloud(post('/media/getSession'))).status).toBe(404);
    expect(onInit).toHaveBeenCalledTimes(1);
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

  it('a stale compose failure does not clear a newer runtime', async () => {
    let attempts = 0;
    let rejectFirst: (cause: Error) => void = () => {};
    const flaky = definePlugin({
      name: 'flaky',
      server: async () => {
        attempts += 1;
        if (attempts === 1) {
          return new Promise<never>((_, reject) => {
            rejectFirst = reject;
          });
        }
        return {
          default: defineServerPlugin({ ping: publicOp(async () => 'pong') }),
        };
      },
    });
    const flakyHandler = createRpcHandler({ plugins: [flaky] });
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const first = flakyHandler(post('/flaky/ping'));
    const destroyed = flakyHandler.destroy();
    const second = flakyHandler(post('/flaky/ping'));
    await new Promise((resolve) => setTimeout(resolve, 0));
    rejectFirst(new Error('deferred import failure'));
    expect((await first).status).toBe(500);
    await destroyed;
    expect((await second).status).toBe(200);
    const third = await flakyHandler(post('/flaky/ping'));
    expect(third.status).toBe(200);
    expect(attempts).toBe(2);
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
    const duringTeardown = handler(post('/search/ping'));
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

  it('takes no session from a server auth plugin that a client-only one overrides', async () => {
    const handler = createRpcHandler({
      plugins: [
        authPlugin(),
        definePlugin({
          name: 'client-auth',
          provides: ['auth'],
          overrides: [{ capability: 'auth' }],
        }),
        mediaPlugin,
      ],
    });
    const res = await handler(
      post('/media/list', { token: 'admin-token', body: { dir: 'a' } })
    );
    expect(res.status).toBe(401);
  });
});

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

describe('createRpcHandler content saves with server hooks', () => {
  const audited = vi.fn();

  const serverHook = <Args extends string[]>(
    name: string,
    factory: (...args: Args) => ServerFormHooks
  ) =>
    defineHook(name, {
      server: async () => ({ default: defineServerHook(factory) }),
    });

  const hooksPlugin = defineHooksPlugin('test:hooks', [
    serverHook('stamp', (label: string) => ({
      beforeSave: (document) => ({
        ...document,
        trail: `${String(document.trail ?? '')}${label}`,
      }),
    })),
    serverHook('guard', () => ({
      beforeSave: (document, { session }) => {
        if (document.published && !session?.roles.includes('admin')) {
          reject('Only admins can publish');
        }
        return document;
      },
    })),
    serverHook('explode', () => ({
      beforeSave: () => {
        throw new Error('db down');
      },
    })),
    serverHook('brokenAudit', () => ({
      afterSave: () => {
        throw new Error('audit endpoint down');
      },
    })),
    serverHook('audit', () => ({ afterSave: audited })),
    serverHook('whoSaves', () => ({
      beforeSave: (document, { session }) => ({
        ...document,
        savedBy: session?.identity.id ?? null,
      }),
    })),
  ]);

  // One plugin that provides content, media and auth, as tinaCloud() does.
  const saving = (hooks: HookRef[]) => {
    const update = vi.fn(async (input: ContentSaveInput) => ({
      path: input.path,
      document: input.value,
    }));
    const getSession = vi.fn(async (request: Request) => {
      const token = request.headers
        .get('authorization')
        ?.replace('Bearer ', '');
      return (token && sessionsByToken[token]) || null;
    });
    const handler = createRpcHandler({
      plugins: [
        definePlugin({
          name: 'test:cloud',
          provides: ['content', 'media', 'auth'],
          server: async () => ({
            default: defineServerPlugin({ getSession, update }),
          }),
        }),
        hooksPlugin,
      ],
      schema: {
        collections: [{ name: 'post', format: 'mdx', fields: [], hooks }],
      },
    });
    const save = (value: Record<string, unknown>, namespace = 'content') =>
      handler(
        post(`/${namespace}/update`, {
          token: 'editor-token',
          body: { collection: 'post', path: 'content/posts/a.mdx', value },
        })
      );
    return { save, update, getSession, handler };
  };

  it('runs two server beforeSave hooks in the collection order, each on the previous output', async () => {
    const { save, update } = saving([
      { name: 'stamp', args: ['b'] },
      { name: 'stamp', args: ['a'] },
    ]);
    const response = await save({ title: 'Hi' });
    expect(response.status).toBe(200);
    expect(update.mock.calls[0][0].value).toEqual({ title: 'Hi', trail: 'ba' });
    expect(await response.json()).toEqual({
      entry: {
        path: 'content/posts/a.mdx',
        document: { title: 'Hi', trail: 'ba' },
      },
      hookWarnings: [],
    });
  });

  it('answers 422 hook-rejected with the message of reject(), and never writes', async () => {
    const { save, update } = saving([{ name: 'guard' }]);
    const response = await save({ published: true });
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({
      error: { code: 'hook-rejected', message: 'Only admins can publish' },
    });
    expect(update).not.toHaveBeenCalled();
  });

  it('500s a hook that throws a plain error, without leaking its message', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const { save, update } = saving([{ name: 'explode' }]);
    const response = await save({});
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain('db down');
    expect(update).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it.each(['media', 'auth'])(
    'runs the hooks on %s/update of a plugin that provides content',
    async (namespace) => {
      const { save, update } = saving([{ name: 'stamp', args: ['x'] }]);
      const response = await save({}, namespace);
      expect(response.status).toBe(200);
      expect(update.mock.calls[0][0].value).toEqual({ trail: 'x' });
    }
  );

  it('runs every afterSave after one throws, keeps the save, and warns', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    audited.mockClear();
    const { save, update } = saving([
      { name: 'brokenAudit' },
      { name: 'audit' },
    ]);
    const response = await save({ title: 'Hi' });
    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledTimes(1);
    expect(audited).toHaveBeenCalledWith(
      { title: 'Hi' },
      expect.objectContaining({ path: 'content/posts/a.mdx' })
    );
    const { hookWarnings } = await response.json();
    expect(hookWarnings).toEqual(['The afterSave hook "brokenAudit" failed.']);
    expect(JSON.stringify(hookWarnings)).not.toContain('audit endpoint down');
    consoleError.mockRestore();
  });

  it('hands the hooks the session getSession verified, with one getSession per save', async () => {
    const { save, update, getSession } = saving([{ name: 'whoSaves' }]);
    await save({});
    expect(update.mock.calls[0][0].value).toEqual({ savedBy: 'eli' });
    expect(getSession).toHaveBeenCalledTimes(1);
  });

  it('hands the hooks the branch the save names', async () => {
    const seen = vi.fn();
    const handler = createRpcHandler({
      plugins: [
        definePlugin({
          name: 'test:cloud',
          provides: ['content', 'auth'],
          server: async () => ({
            default: defineServerPlugin({
              getSession: async () => sessionsByToken['editor-token'],
              update: async (input: ContentSaveInput) => ({
                path: input.path,
                document: input.value,
              }),
            }),
          }),
        }),
        defineHooksPlugin('test:branch', [
          serverHook('branchProbe', () => ({
            beforeSave: (document, { branch }) => {
              seen(branch);
              return document;
            },
          })),
        ]),
      ],
      schema: {
        collections: [
          {
            name: 'post',
            format: 'mdx',
            fields: [],
            hooks: [{ name: 'branchProbe' }],
          },
        ],
      },
    });
    await handler(
      post('/content/update', {
        body: {
          collection: 'post',
          path: 'content/posts/a.mdx',
          value: {},
          branch: 'feature',
        },
      })
    );
    expect(seen).toHaveBeenCalledWith('feature');
  });

  it.each([
    ['a body with no value', { collection: 'post', path: 'a.mdx' }],
    ['an unknown collection', { collection: 'nope', path: 'a.mdx', value: {} }],
  ])('400s %s with invalid-input', async (_, body) => {
    const { handler, update } = saving([]);
    const response = await handler(
      post('/content/update', { token: 'editor-token', body })
    );
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe('invalid-input');
    expect(update).not.toHaveBeenCalled();
  });

  it('routes no update of a plugin that lost content to an override', async () => {
    const rawUpdate = vi.fn(async () => ({ path: 'x', document: {} }));
    const handler = createRpcHandler({
      plugins: [
        definePlugin({
          name: 'test:cloud',
          provides: ['content', 'media', 'auth'],
          server: async () => ({
            default: defineServerPlugin({
              getSession: async () => sessionsByToken['admin-token'],
              update: rawUpdate,
            }),
          }),
        }),
        definePlugin({
          name: 'test:other-content',
          provides: ['content'],
          overrides: [{ capability: 'content' }],
        }),
      ],
    });
    for (const namespace of ['media', 'auth']) {
      const response = await handler(
        post(`/${namespace}/update`, { token: 'admin-token', body: {} })
      );
      expect(response.status).toBe(404);
    }
    expect(rawUpdate).not.toHaveBeenCalled();
  });

  it('fails to compose when a server hook is installed but no schema is passed', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const handler = createRpcHandler({ plugins: [hooksPlugin] });
    const response = await handler(post('/content/update', { body: {} }));
    expect(response.status).toBe(500);
    expect((await response.json()).error.code).toBe('runtime-compose-failed');
    expect(String(consoleError.mock.calls[0]?.[1])).toMatch(/no `schema`/);
    consoleError.mockRestore();
  });

  it('never routes the reserved hooks key of a server segment', async () => {
    const { handler } = saving([]);
    for (const path of ['/content/hooks', '/test:hooks/hooks']) {
      const response = await handler(post(path, { token: 'admin-token' }));
      expect(response.status).toBe(404);
    }
  });
});
