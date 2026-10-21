import { EventEmitter } from 'node:events';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { existsSync } from 'node:fs';
import { asResolvedConfig } from '../../../../config';
import { DEFAULT_CONTENT_URL } from '../../../../core/content/contract';
import { DEFAULT_MEDIA_URL } from '../../../../core/media/contract';
import { MAX_REQUEST_BODY_BYTES } from '../../../../core/request-body';
import {
  defineHook,
  defineHooksPlugin,
  defineServerHook,
  reject,
} from '../../../../core/form/hooks';
import { type PluginManifest, definePlugin } from '../../../../core/plugin';
import type { HookRef } from '../../../../core/schema/types';
import {
  type ServerSegment,
  defineServerPlugin,
  toUserId,
  use,
} from '../../../../server';
import { localMediaPlugin } from '../../../media/local/local-media.plugin';
import { tinaCloud } from '../../../tinacloud/tinacloud.plugin';
import { localContentPlugin } from '../local-content.plugin';
import { tinaLocalDataLayerVitePlugin } from './local-data-layer.vite';

vi.mock('../graphql/graphql-pipeline', () => ({
  createGraphQLPipeline: vi.fn(),
}));

vi.mock('../../../../cli/commands/codegen', () => ({
  runCodegen: vi.fn(async () => ({ outcome: 'unchanged', admin: [] })),
}));

const SAME_ORIGIN = {
  host: 'localhost:5173',
  origin: 'http://localhost:5173',
};

const authPluginWith = (server: ServerSegment) =>
  definePlugin({
    name: 'test:auth',
    provides: ['auth'],
    server: async () => ({ default: defineServerPlugin(server) }),
  });

const authPlugin = authPluginWith({
  getSession: async (request: Request) =>
    request.headers.get('authorization') === 'Bearer good'
      ? { identity: { id: toUserId('ada') }, roles: ['editor'] }
      : null,
});

let rootDir: string;

beforeEach(async () => {
  rootDir = await fs.mkdtemp(path.join(tmpdir(), 'tina-vite-auth-'));
  await fs.mkdir(path.join(rootDir, 'content/posts'), { recursive: true });
});

afterEach(async () => {
  await fs.rm(rootDir, { recursive: true, force: true });
});

// The body flows once a reader attaches, as a paused Node stream delivers it.
const requestDouble = (
  url: string,
  method: string,
  headers: Record<string, string>,
  body: string | Buffer = ''
) => {
  const req = Object.assign(new EventEmitter(), {
    url,
    method,
    headers,
    destroyed: false,
    setEncoding: () => {},
    pause: () => {},
    destroy() {
      req.destroyed = true;
    },
  });
  req.on('newListener', (event) => {
    if (event !== 'data') return;
    queueMicrotask(() => {
      req.emit('data', body);
      req.emit('end');
    });
  });
  return req;
};

const responseDouble = () => {
  const chunks: string[] = [];
  return {
    statusCode: 200,
    destroyed: false,
    setHeader: () => {},
    end(chunk?: string) {
      if (chunk !== undefined) chunks.push(chunk);
    },
    get body() {
      return chunks.join('');
    },
  };
};

const mountedRoutes = (plugins: PluginManifest[], hooks: HookRef[] = []) => {
  const plugin = tinaLocalDataLayerVitePlugin({
    rootDir,
    config: asResolvedConfig({
      plugins: [localMediaPlugin(), ...plugins],
      schema: {
        collections: [
          {
            name: 'posts',
            path: 'content/posts',
            format: 'mdx',
            fields: [{ type: 'string', name: 'title' }],
            hooks,
          },
        ],
      },
      build: { publicFolder: 'public', outputFolder: 'admin' },
    }),
  });
  const mounted = new Map<string, Function>();
  (plugin.configureServer as (server: unknown) => void)({
    config: { logger: { info: () => {} } },
    middlewares: {
      use: (route: string | Function, handler?: Function) => {
        if (typeof route === 'string' && handler) mounted.set(route, handler);
      },
    },
  });
  return mounted;
};

const send = async (
  plugins: PluginManifest[],
  route: string,
  req: ReturnType<typeof requestDouble>
) => {
  const res = responseDouble();
  await mountedRoutes(plugins).get(route)?.(req, res);
  return res;
};

const jsonHeaders = (headers: Record<string, string>) => ({
  ...SAME_ORIGIN,
  'content-type': 'application/json',
  ...headers,
});

const uploadRequest = async (headers: Record<string, string>) => {
  const form = new FormData();
  form.append('folder', '');
  form.append('file', new File(['x'], 'a.png'));
  const request = new Request('http://localhost/upload', {
    method: 'POST',
    body: form,
  });
  return requestDouble(
    '/upload',
    'POST',
    {
      ...SAME_ORIGIN,
      'content-type': request.headers.get('content-type') ?? '',
      ...headers,
    },
    Buffer.from(await request.arrayBuffer())
  );
};

const requests = {
  'content list': async (headers: Record<string, string>) => ({
    route: DEFAULT_CONTENT_URL,
    req: requestDouble(
      '/',
      'POST',
      jsonHeaders(headers),
      JSON.stringify({ op: 'list', collection: 'posts' })
    ),
  }),
  'media list': async (headers: Record<string, string>) => ({
    route: DEFAULT_MEDIA_URL,
    req: requestDouble('/?folder=', 'GET', { ...SAME_ORIGIN, ...headers }),
  }),
  'media upload': async (headers: Record<string, string>) => ({
    route: DEFAULT_MEDIA_URL,
    req: await uploadRequest(headers),
  }),
};

type RequestName = keyof typeof requests;
const REQUEST_NAMES = Object.keys(requests) as RequestName[];

const sendNamed = async (
  plugins: PluginManifest[],
  name: RequestName,
  headers: Record<string, string> = {}
) => {
  const { route, req } = await requests[name](headers);
  return send(plugins, route, req);
};

describe('local Data Layer with an auth plugin', () => {
  it.each(REQUEST_NAMES)('serves a %s with a session', async (name) => {
    const res = await sendNamed([authPlugin], name, {
      authorization: 'Bearer good',
    });
    expect(res.statusCode).toBe(200);
  });

  it.each(REQUEST_NAMES)('401s a %s with no session', async (name) => {
    const res = await sendNamed([authPlugin], name, {
      authorization: 'Bearer bad',
    });
    expect(res.statusCode).toBe(401);
  });

  it('401s a media delete with no session, and deletes nothing', async () => {
    const res = await send(
      [authPlugin],
      DEFAULT_MEDIA_URL,
      requestDouble(
        '/',
        'POST',
        jsonHeaders({}),
        JSON.stringify({ op: 'delete', path: 'a.png' })
      )
    );
    expect(res.statusCode).toBe(401);
  });

  it('401s every request when the auth plugin has no getSession', async () => {
    const res = await sendNamed([authPluginWith({})], 'content list', {
      authorization: 'Bearer good',
    });
    expect(res.statusCode).toBe(401);
  });

  it('checks sessions when a server auth plugin overrides a client-only one', async () => {
    const clientOnlyAuth = definePlugin({
      name: 'test:client-auth',
      provides: ['auth'],
    });
    const override: PluginManifest = {
      ...authPlugin,
      name: 'test:override-auth',
      overrides: [{ capability: 'auth' }],
    };
    const res = await sendNamed([clientOnlyAuth, override], 'content list', {
      authorization: 'Bearer bad',
    });
    expect(res.statusCode).toBe(401);
  });

  it('checks nothing when a client-only auth plugin overrides a server one', async () => {
    const clientOnlyOverride = definePlugin({
      name: 'test:client-auth',
      provides: ['auth'],
      overrides: [{ capability: 'auth' }],
    });
    const res = await sendNamed(
      [authPlugin, clientOnlyOverride],
      'content list'
    );
    expect(res.statusCode).toBe(200);
  });

  it('checks the permission the winning media plugin requires', async () => {
    const override: PluginManifest = {
      ...localMediaPlugin(),
      name: 'test:media',
      overrides: [{ capability: 'media' }],
      requires: { permission: 'media:admin' },
    };
    const res = await sendNamed([authPlugin, override], 'media list', {
      authorization: 'Bearer good',
    });
    expect(res.statusCode).toBe(403);
  });

  it('resolves use(capability) inside getSession', async () => {
    const composingAuth = authPluginWith({
      ping: async () => true,
      getSession: async () => {
        await (use('auth').ping as () => Promise<unknown>)();
        return { identity: { id: toUserId('ada') }, roles: ['editor'] };
      },
    });
    expect((await sendNamed([composingAuth], 'content list')).statusCode).toBe(
      200
    );
  });

  it('500s with a generic body when getSession throws', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const throwingAuth = authPluginWith({
      getSession: async () => {
        throw new Error('database password is hunter2');
      },
    });
    const res = await sendNamed([throwingAuth], 'content list');
    expect(res.statusCode).toBe(500);
    expect(res.body).toBe('Session check failed.');
    consoleError.mockRestore();
  });
});

describe('local Data Layer with no auth plugin', () => {
  it.each(REQUEST_NAMES)('serves a %s with no token', async (name) => {
    expect((await sendNamed([], name)).statusCode).toBe(200);
  });
});

describe('local Data Layer content/update', () => {
  const seenSessions = vi.fn();
  const noDrafts = defineHook('noDrafts', {
    server: async () => ({
      default: defineServerHook(() => ({
        beforeSave: (document, { session }) => {
          seenSessions(session);
          if (document.draft) reject('Publish the post before you save it');
          return document;
        },
      })),
    }),
  });
  const hooksPlugin = defineHooksPlugin('test:hooks', [noDrafts]);

  const save = async (value: Record<string, unknown>) => {
    const res = responseDouble();
    const req = requestDouble(
      '/',
      'POST',
      jsonHeaders({}),
      JSON.stringify({
        collection: 'posts',
        path: 'content/posts/a.mdx',
        value,
      })
    );
    await mountedRoutes([localContentPlugin(), hooksPlugin], [noDrafts()]).get(
      '/api/tina/content/update'
    )?.(req, res);
    return res;
  };

  it('vetoes the save through the hook, and writes nothing', async () => {
    const res = await save({ title: 'A', draft: true });
    expect(res.statusCode).toBe(422);
    expect(JSON.parse(res.body)).toEqual({
      error: {
        code: 'hook-rejected',
        message: 'Publish the post before you save it',
      },
    });
    expect(existsSync(path.join(rootDir, 'content/posts/a.mdx'))).toBe(false);
  });

  it('hands the hook a null session when no auth plugin is installed', async () => {
    seenSessions.mockClear();
    const res = await save({ title: 'A' });
    expect(res.statusCode).toBe(200);
    expect(seenSessions).toHaveBeenCalledWith(null);
    expect(existsSync(path.join(rootDir, 'content/posts/a.mdx'))).toBe(true);
  });
});

describe('local Data Layer updates', () => {
  const noDrafts = defineHook('noDrafts', {
    server: async () => ({
      default: defineServerHook(() => ({
        beforeSave: (document) => {
          if (document.draft) reject('Publish the post before you save it');
          if (document.broken) throw new Error('quota table offline');
          return document;
        },
      })),
    }),
  });
  const viewerAuth = authPluginWith({
    getSession: async () => ({
      identity: { id: toUserId('vic') },
      roles: ['viewer'],
    }),
  });
  const routesWith = (plugins: PluginManifest[]) =>
    mountedRoutes(
      [
        localContentPlugin(),
        defineHooksPlugin('test:hooks', [noDrafts]),
        ...plugins,
      ],
      [noDrafts()]
    );
  const call = async (
    routes: ReturnType<typeof mountedRoutes>,
    route: string,
    body: string
  ) => {
    const res = responseDouble();
    await routes.get(route)?.(
      requestDouble('/', 'POST', jsonHeaders({}), body),
      res
    );
    return res;
  };
  const update = (value: Record<string, unknown>) =>
    JSON.stringify({ collection: 'posts', path: 'content/posts/a.mdx', value });

  it('runs the server hooks for an update on the content route', async () => {
    const res = await call(
      routesWith([]),
      DEFAULT_CONTENT_URL,
      JSON.stringify({ op: 'update', ...JSON.parse(update({ draft: true })) })
    );
    expect(res.statusCode).toBe(422);
    expect(JSON.parse(res.body)).toEqual({
      error: {
        code: 'hook-rejected',
        message: 'Publish the post before you save it',
      },
    });
    expect(existsSync(path.join(rootDir, 'content/posts/a.mdx'))).toBe(false);
  });

  it('answers a plain hook throw on the content route with the generic 500', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const res = await call(
      routesWith([]),
      DEFAULT_CONTENT_URL,
      JSON.stringify({ op: 'update', ...JSON.parse(update({ broken: true })) })
    );
    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res.body).error.code).toBe('op-failed');
    expect(res.body).not.toContain('quota table offline');
    consoleError.mockRestore();
  });

  it('answers 413 for a content/update body over the size limit', async () => {
    const res = await call(
      routesWith([]),
      '/api/tina/content/update',
      'x'.repeat(MAX_REQUEST_BODY_BYTES + 1)
    );
    expect(res.statusCode).toBe(413);
    expect(JSON.parse(res.body).error.code).toBe('body-too-large');
  });

  it('requires content:save for every local update', async () => {
    const routes = routesWith([viewerAuth]);
    const viaContent = await call(
      routes,
      DEFAULT_CONTENT_URL,
      JSON.stringify({ op: 'update', ...JSON.parse(update({})) })
    );
    const viaUpdate = await call(
      routes,
      '/api/tina/content/update',
      update({})
    );
    const list = await call(
      routes,
      DEFAULT_CONTENT_URL,
      JSON.stringify({ op: 'list', collection: 'posts' })
    );
    expect([
      viaContent.statusCode,
      viaUpdate.statusCode,
      list.statusCode,
    ]).toEqual([403, 403, 200]);
    expect(existsSync(path.join(rootDir, 'content/posts/a.mdx'))).toBe(false);
  });

  it('answers 400 invalid-input for a body that is not JSON', async () => {
    const res = await call(routesWith([]), '/api/tina/content/update', '{nope');
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error.code).toBe('invalid-input');
  });
});

describe('local Data Layer in TinaCloud mode', () => {
  it('serves no content/update, and passes the path on from the content route', async () => {
    const routes = mountedRoutes([tinaCloud({ clientId: 'abc' })]);
    expect(routes.has('/api/tina/content/update')).toBe(false);

    const res = responseDouble();
    const next = vi.fn();
    await routes.get(DEFAULT_CONTENT_URL)?.(
      requestDouble(
        '/update',
        'POST',
        jsonHeaders({}),
        JSON.stringify({
          collection: 'posts',
          path: 'content/posts/a.mdx',
          value: {},
        })
      ),
      res,
      next
    );
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.body).toBe('');
  });
});
