import { EventEmitter } from 'node:events';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../../../../config';
import { DEFAULT_CONTENT_URL } from '../../../../core/content/contract';
import { DEFAULT_MEDIA_URL } from '../../../../core/media/contract';
import { type PluginManifest, definePlugin } from '../../../../core/plugin';
import {
  type ServerSegment,
  defineServerPlugin,
  toUserId,
  use,
} from '../../../../server';
import { localMediaPlugin } from '../../../media/local/local-media.plugin';
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

const mountedRoutes = (plugins: PluginManifest[]) => {
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
