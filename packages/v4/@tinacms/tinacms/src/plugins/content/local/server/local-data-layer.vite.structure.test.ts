import { EventEmitter } from 'node:events';
import { existsSync, promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../../../../config';
import { toUserId } from '../../../../core/auth/contract';
import { DEFAULT_CONTENT_URL } from '../../../../core/content/contract';
import {
  defineHook,
  defineHooksPlugin,
  defineServerHook,
  reject,
} from '../../../../core/form/hooks';
import { type PluginManifest, definePlugin } from '../../../../core/plugin';
import type { CollectionSchema } from '../../../../core/schema/types';
import { defineServerPlugin } from '../../../../server';
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
  'content-type': 'application/json',
};

// A role's permissions come from this map, so a test can hold exactly one.
const ROLES: Record<string, string[]> = {
  saver: ['content:save'],
  creator: ['content:save', 'content:create'],
  renamer: ['content:rename'],
  deleter: ['content:delete'],
  viewer: [],
};

const authPlugin = (withRoleMap: boolean) =>
  definePlugin({
    name: 'test:auth',
    provides: ['auth'],
    server: async () => ({
      default: defineServerPlugin({
        getSession: async (request: Request) => {
          const token = request.headers.get('authorization')?.slice(7);
          return token
            ? { identity: { id: toUserId(token) }, roles: [token] }
            : null;
        },
        ...(withRoleMap
          ? { rolePermissions: async (role: string) => ROLES[role] ?? [] }
          : {}),
      }),
    }),
  });

let rootDir: string;

beforeEach(async () => {
  rootDir = await fs.mkdtemp(path.join(tmpdir(), 'tina-vite-structure-'));
  await fs.mkdir(path.join(rootDir, 'content/posts'), { recursive: true });
  await fs.writeFile(
    path.join(rootDir, 'content/posts/a.mdx'),
    '---\ntitle: A\n---\n'
  );
});

afterEach(() => fs.rm(rootDir, { recursive: true, force: true }));

const requestDouble = (
  url: string,
  headers: Record<string, string>,
  body: string
) => {
  const req = Object.assign(new EventEmitter(), {
    url,
    method: 'POST',
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

const POSTS: CollectionSchema = {
  name: 'posts',
  path: 'content/posts',
  format: 'mdx',
  fields: [{ type: 'string', name: 'title' }],
};

const mount = (
  plugins: PluginManifest[],
  collections: CollectionSchema[] = [POSTS]
) => {
  const plugin = tinaLocalDataLayerVitePlugin({
    rootDir,
    config: asResolvedConfig({
      plugins: [localContentPlugin(), ...plugins],
      schema: { collections },
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

type Routes = ReturnType<typeof mount>;

const post = async (
  routes: Routes,
  route: string,
  body: unknown,
  token?: string
) => {
  const res = responseDouble();
  await routes.get(route)?.(
    requestDouble(
      '/',
      {
        ...SAME_ORIGIN,
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      JSON.stringify(body)
    ),
    res
  );
  return {
    status: res.statusCode,
    body: res.body ? JSON.parse(res.body) : null,
  };
};

const content = (routes: Routes, body: unknown, token?: string) =>
  post(routes, DEFAULT_CONTENT_URL, body, token);

const onDisk = (relative: string) => existsSync(path.join(rootDir, relative));

describe('permissions per operation', () => {
  const operations = {
    create: {
      token: 'creator',
      body: {
        op: 'create',
        collection: 'posts',
        path: 'content/posts/n.mdx',
        value: {},
      },
    },
    createFolder: {
      token: 'creator',
      body: { op: 'createFolder', collection: 'posts', folder: 'f' },
    },
    rename: {
      token: 'renamer',
      body: {
        op: 'rename',
        collection: 'posts',
        from: 'content/posts/a.mdx',
        to: 'content/posts/b.mdx',
      },
    },
    renameFolder: {
      token: 'renamer',
      body: { op: 'renameFolder', collection: 'posts', from: 'x', to: 'y' },
    },
    delete: {
      token: 'deleter',
      body: { op: 'delete', collection: 'posts', path: 'content/posts/a.mdx' },
    },
    deleteFolder: {
      token: 'deleter',
      body: { op: 'deleteFolder', collection: 'posts', folder: 'x' },
    },
  } as const;

  it.each(Object.entries(operations))(
    'answers 403 to %s from a role that lacks its permission, and changes nothing',
    async (_name, { body, token }) => {
      const routes = mount([authPlugin(true)]);
      const others = [
        'saver',
        'creator',
        'renamer',
        'deleter',
        'viewer',
      ].filter((role) => role !== token);
      for (const role of others) {
        const res = await content(routes, body, role);
        expect(res.status).toBe(403);
      }
      expect(onDisk('content/posts/a.mdx')).toBe(true);
      expect(onDisk('content/posts/n.mdx')).toBe(false);
      expect(onDisk('content/posts/f')).toBe(false);
      expect(onDisk('content/posts/b.mdx')).toBe(false);
    }
  );

  it('lets a viewer list, get and ask for referrers with a session only', async () => {
    const routes = mount([authPlugin(true)]);
    for (const body of [
      { op: 'list', collection: 'posts' },
      { op: 'get', collection: 'posts', path: 'content/posts/a.mdx' },
      { op: 'referrers', collection: 'posts', path: 'content/posts/a.mdx' },
    ]) {
      expect((await content(routes, body, 'viewer')).status).toBe(200);
    }
    expect(
      (await content(routes, { op: 'list', collection: 'posts' })).status
    ).toBe(401);
  });

  it('gives the default editor all four content permissions and the default admin all', async () => {
    const routes = mount([authPlugin(false)]);
    const created = await content(routes, operations.create.body, 'editor');
    expect(created.status).toBe(200);
    expect(
      (await content(routes, operations.rename.body, 'editor')).status
    ).toBe(200);
    expect(
      (
        await content(
          routes,
          { op: 'delete', collection: 'posts', path: 'content/posts/n.mdx' },
          'admin'
        )
      ).status
    ).toBe(200);
    expect(
      (await content(routes, operations.createFolder.body, 'saver')).status
    ).toBe(403);
  });
});

describe('an update to a path with no file', () => {
  const missing = {
    collection: 'posts',
    path: 'content/posts/new.mdx',
    value: { title: 'New' },
  };

  it.each([
    ['the content endpoint', DEFAULT_CONTENT_URL, { op: 'update', ...missing }],
    ['the content/update route', '/api/tina/content/update', missing],
  ])(
    'answers 403 on %s to a role with content:save only, and writes nothing',
    async (_name, route, body) => {
      const routes = mount([authPlugin(true)]);
      const res = await post(routes, route, body, 'saver');
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('forbidden');
      expect(onDisk('content/posts/new.mdx')).toBe(false);
    }
  );

  it.each([
    ['the content endpoint', DEFAULT_CONTENT_URL, { op: 'update', ...missing }],
    ['the content/update route', '/api/tina/content/update', missing],
  ])(
    'writes the file on %s for a role with content:create',
    async (_name, route, body) => {
      const routes = mount([authPlugin(true)]);
      expect((await post(routes, route, body, 'creator')).status).toBe(200);
      expect(onDisk('content/posts/new.mdx')).toBe(true);
    }
  );

  it('saves an existing file for a role with content:save only', async () => {
    const routes = mount([authPlugin(true)]);
    const res = await content(
      routes,
      {
        op: 'update',
        collection: 'posts',
        path: 'content/posts/a.mdx',
        value: { title: 'Changed' },
      },
      'saver'
    );
    expect(res.status).toBe(200);
  });

  it('writes the file with no auth plugin, as today', async () => {
    const routes = mount([]);
    expect((await content(routes, { op: 'update', ...missing })).status).toBe(
      200
    );
    expect(onDisk('content/posts/new.mdx')).toBe(true);
  });

  it('refuses with forbidden for every role when both create switches are off', async () => {
    const routes = mount(
      [authPlugin(false)],
      [{ ...POSTS, allowedActions: { canCreate: false, canDuplicate: false } }]
    );
    const res = await content(routes, { op: 'update', ...missing }, 'admin');
    expect(res.status).toBe(403);
    expect(onDisk('content/posts/new.mdx')).toBe(false);
  });

  it('refuses a missing name the rules refuse with invalid-path', async () => {
    const routes = mount([]);
    const res = await content(routes, {
      op: 'update',
      collection: 'posts',
      path: 'content/posts/.gitkeep.mdx',
      value: {},
    });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('invalid-path');
  });
});

describe('error bodies', () => {
  it('answers each refusal with its code and status as a JSON error', async () => {
    const routes = mount([]);
    const cases: [unknown, number, string][] = [
      [
        {
          op: 'create',
          collection: 'posts',
          path: 'content/posts/a.mdx',
          value: {},
        },
        422,
        'name-taken',
      ],
      [
        {
          op: 'rename',
          collection: 'posts',
          from: 'content/posts/a.mdx',
          to: 'content/posts/.x.mdx',
        },
        422,
        'invalid-path',
      ],
      [
        { op: 'delete', collection: 'posts', path: 'content/posts/none.mdx' },
        422,
        'not-found',
      ],
      [
        { op: 'list', collection: 'posts', query: { first: 999 } },
        422,
        'validation',
      ],
      [{ op: 'list', collection: 'nope' }, 400, 'invalid-input'],
      [{ op: 'bogus' }, 400, 'invalid-input'],
    ];
    for (const [body, status, code] of cases) {
      const res = await content(routes, body);
      expect([res.status, res.body.error.code]).toEqual([status, code]);
    }
  });

  it('answers folder-not-owned for a folder another collection owns', async () => {
    await fs.mkdir(path.join(rootDir, 'content/posts/nested'), {
      recursive: true,
    });
    const routes = mount(
      [],
      [
        { ...POSTS, name: 'site', path: 'content' },
        { ...POSTS, name: 'posts', path: 'content/posts/nested' },
      ]
    );
    const res = await content(routes, {
      op: 'deleteFolder',
      collection: 'site',
      folder: 'posts/nested',
    });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('folder-not-owned');
  });

  it('answers a delete with null and removes the file', async () => {
    const res = await content(mount([]), {
      op: 'delete',
      collection: 'posts',
      path: 'content/posts/a.mdx',
    });
    expect(res).toEqual({ status: 200, body: null });
    expect(onDisk('content/posts/a.mdx')).toBe(false);
  });

  it('answers allowedActions refusals with 403 forbidden for admin too', async () => {
    const routes = mount(
      [authPlugin(false)],
      [
        {
          ...POSTS,
          allowedActions: { canDelete: false, canCreateFolder: false },
        },
      ]
    );
    const deleted = await content(
      routes,
      { op: 'delete', collection: 'posts', path: 'content/posts/a.mdx' },
      'admin'
    );
    const folder = await content(
      routes,
      { op: 'createFolder', collection: 'posts', folder: 'f' },
      'admin'
    );
    expect([deleted.status, folder.status]).toEqual([403, 403]);
    expect(onDisk('content/posts/a.mdx')).toBe(true);
  });
});

describe('create runs the server hooks', () => {
  const noDrafts = defineHook('noDrafts', {
    server: async () => ({
      default: defineServerHook(() => ({
        beforeSave: (document) => {
          if (document.draft) reject('Publish the post before you save it');
          return document;
        },
      })),
    }),
  });
  const hooked: CollectionSchema = { ...POSTS, hooks: [noDrafts()] };
  const plugins = (auth: PluginManifest[] = []) => [
    defineHooksPlugin('test:hooks', [noDrafts]),
    ...auth,
  ];
  const body = (value: Record<string, unknown>) => ({
    collection: 'posts',
    path: 'content/posts/new.mdx',
    value,
  });

  it('vetoes a create on the content endpoint and on content/create, writing nothing', async () => {
    const routes = mount(plugins(), [hooked]);
    const viaContent = await content(routes, {
      op: 'create',
      ...body({ draft: true }),
    });
    const viaRoute = await post(
      routes,
      '/api/tina/content/create',
      body({ draft: true })
    );
    expect([viaContent.status, viaRoute.status]).toEqual([422, 422]);
    expect(viaRoute.body.error).toEqual({
      code: 'hook-rejected',
      message: 'Publish the post before you save it',
    });
    expect(onDisk('content/posts/new.mdx')).toBe(false);
  });

  it('writes through content/create when the hook passes, and refuses a taken path with name-taken', async () => {
    const routes = mount(plugins(), [hooked]);
    expect(
      (await post(routes, '/api/tina/content/create', body({ title: 'N' })))
        .status
    ).toBe(200);
    expect(onDisk('content/posts/new.mdx')).toBe(true);
    const again = await post(routes, '/api/tina/content/create', body({}));
    expect([again.status, again.body.error.code]).toEqual([422, 'name-taken']);
  });

  it('needs content:create on content/create', async () => {
    const routes = mount(plugins([authPlugin(true)]), [hooked]);
    expect(
      (await post(routes, '/api/tina/content/create', body({}), 'saver')).status
    ).toBe(403);
    expect(onDisk('content/posts/new.mdx')).toBe(false);
    expect(
      (await post(routes, '/api/tina/content/create', body({}), 'creator'))
        .status
    ).toBe(200);
  });
});
