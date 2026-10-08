import { EventEmitter } from 'node:events';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../../../../config';
import { DEFAULT_CONTENT_URL } from '../../../../core/content/contract';
import { DEFAULT_MEDIA_URL } from '../../../../core/media/contract';
import { type PluginManifest, definePlugin } from '../../../../core/plugin';
import { defineServerPlugin, toUserId } from '../../../../server';
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

const authPlugin = definePlugin({
  name: 'test:auth',
  provides: ['auth'],
  server: async () => ({
    default: defineServerPlugin({
      getSession: async (request: Request) =>
        request.headers.get('authorization') === 'Bearer good'
          ? { identity: { id: toUserId('ada') }, roles: ['editor'] }
          : null,
    }),
  }),
});

let rootDir: string;

beforeEach(async () => {
  rootDir = await fs.mkdtemp(path.join(tmpdir(), 'tina-vite-auth-'));
  await fs.mkdir(path.join(rootDir, 'content/posts'), { recursive: true });
});

afterEach(async () => {
  await fs.rm(rootDir, { recursive: true, force: true });
});

// The body arrives once the handler reads it, as a paused Node stream delivers it.
const requestDouble = (
  url: string,
  method: string,
  headers: Record<string, string>,
  body = ''
) => {
  const req = Object.assign(new EventEmitter(), {
    url,
    method,
    headers,
    destroyed: false,
    setEncoding: () => {
      queueMicrotask(() => {
        req.emit('data', body);
        req.emit('end');
      });
    },
    pause: () => {},
    destroy() {
      req.destroyed = true;
    },
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

const listContent = async (
  plugins: PluginManifest[],
  headers: Record<string, string> = {}
) => {
  const res = responseDouble();
  await mountedRoutes(plugins).get(DEFAULT_CONTENT_URL)?.(
    requestDouble(
      '/',
      'POST',
      { ...SAME_ORIGIN, 'content-type': 'application/json', ...headers },
      JSON.stringify({ op: 'list', collection: 'posts' })
    ),
    res
  );
  return res;
};

const listMedia = async (
  plugins: PluginManifest[],
  headers: Record<string, string> = {}
) => {
  const res = responseDouble();
  await mountedRoutes(plugins).get(DEFAULT_MEDIA_URL)?.(
    requestDouble('/?folder=', 'GET', { ...SAME_ORIGIN, ...headers }),
    res
  );
  return res;
};

describe('local Data Layer with an auth plugin', () => {
  it('serves content and media to a request with a session', async () => {
    const authorization = { authorization: 'Bearer good' };
    expect((await listContent([authPlugin], authorization)).statusCode).toBe(
      200
    );
    expect((await listMedia([authPlugin], authorization)).statusCode).toBe(200);
  });

  it('401s content and media requests with no session', async () => {
    const content = await listContent([authPlugin]);
    expect(content.statusCode).toBe(401);
    expect(content.body).toBe('No CMS session.');
    const media = await listMedia([authPlugin], {
      authorization: 'Bearer bad',
    });
    expect(media.statusCode).toBe(401);
  });

  it('serves a request with no token when no plugin provides auth', async () => {
    expect((await listContent([])).statusCode).toBe(200);
    expect((await listMedia([])).statusCode).toBe(200);
  });
});
