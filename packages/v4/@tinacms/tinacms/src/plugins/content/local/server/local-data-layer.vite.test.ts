import { EventEmitter } from 'node:events';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type ResolvedConfig, asResolvedConfig } from '../../../../config';
import { DEFAULT_CONTENT_URL } from '../../../../core/content/contract';
import { definePlugin } from '../../../../core/plugin';
import type { CollectionSchema } from '../../../../core/schema/types';
import { createGraphQLPipeline } from '../graphql/graphql-pipeline';
import { tinaLocalDataLayerVitePlugin } from './local-data-layer.vite';

vi.mock('../graphql/graphql-pipeline', () => ({
  createGraphQLPipeline: vi.fn(),
}));

const POSTS: CollectionSchema = {
  name: 'posts',
  label: 'Posts',
  path: 'content/posts',
  format: 'mdx',
  fields: [{ type: 'string', name: 'title', label: 'Title' }],
};

let rootDir: string;

beforeEach(async () => {
  rootDir = await fs.mkdtemp(path.join(tmpdir(), 'tina-vite-'));
  await fs.mkdir(path.join(rootDir, 'content/posts'), { recursive: true });
  await fs.writeFile(
    path.join(rootDir, 'content/posts/hello.mdx'),
    '---\ntitle: Hello\n---\n'
  );
});

afterEach(async () => {
  vi.restoreAllMocks();
  await fs.rm(rootDir, { recursive: true, force: true });
});

const requestDouble = (
  headers: Record<string, string>,
  body?: string | string[]
) => {
  const req = Object.assign(new EventEmitter(), {
    headers,
    paused: false,
    destroyed: false,
    setEncoding: () => {},
    pause() {
      req.paused = true;
    },
    destroy() {
      req.destroyed = true;
    },
  });
  if (body !== undefined) {
    queueMicrotask(() => {
      for (const chunk of Array.isArray(body) ? body : [body]) {
        req.emit('data', chunk);
      }
      req.emit('end');
    });
  }
  return req;
};

const responseDouble = () => {
  const chunks: string[] = [];
  return {
    statusCode: 200,
    destroyed: false,
    headers: {} as Record<string, string>,
    setHeader(name: string, value: string) {
      this.headers[name] = value;
    },
    end(chunk?: string, callback?: () => void) {
      if (chunk !== undefined) chunks.push(chunk);
      callback?.();
    },
    get body() {
      return chunks.join('');
    },
  };
};

const middlewareOf = (url?: string) => {
  const plugin = tinaLocalDataLayerVitePlugin({
    rootDir,
    collections: [POSTS],
    ...(url ? { url } : {}),
  });
  let mounted: { route: string; handler: Function } | null = null;
  const server = {
    middlewares: {
      use: (route: string, handler: Function) => {
        mounted = { route, handler };
      },
    },
  };
  (plugin.configureServer as (s: unknown) => void)(server);
  if (!mounted) throw new Error('The plugin mounted no middleware.');
  return mounted;
};

const JSON_HEADERS = {
  'content-type': 'application/json',
  host: 'localhost:5173',
  origin: 'http://localhost:5173',
};

describe('tinaLocalDataLayerVitePlugin middleware', () => {
  it('serves a same-origin JSON content request', async () => {
    const { handler } = middlewareOf();
    const res = responseDouble();
    await handler(
      requestDouble(
        JSON_HEADERS,
        JSON.stringify({ op: 'list', collection: 'posts' })
      ),
      res
    );
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('application/json');
    expect(res.body).toContain('hello.mdx');
  });

  it('serves a request with no Origin header, which is what curl sends', async () => {
    const { handler } = middlewareOf();
    const res = responseDouble();
    await handler(
      requestDouble(
        { 'content-type': 'application/json', host: 'localhost:5173' },
        JSON.stringify({ op: 'list', collection: 'posts' })
      ),
      res
    );
    expect(res.statusCode).toBe(200);
  });

  it('403s a cross-origin request', async () => {
    const { handler } = middlewareOf();
    const res = responseDouble();
    await handler(
      requestDouble(
        { ...JSON_HEADERS, origin: 'http://evil.example' },
        JSON.stringify({ op: 'list', collection: 'posts' })
      ),
      res
    );
    expect(res.statusCode).toBe(403);
  });

  it('403s a request whose Host is not a loopback name', async () => {
    const { handler } = middlewareOf();
    const res = responseDouble();
    await handler(
      requestDouble(
        {
          ...JSON_HEADERS,
          host: 'content.example:5173',
          origin: 'http://content.example:5173',
        },
        JSON.stringify({ op: 'list', collection: 'posts' })
      ),
      res
    );
    expect(res.statusCode).toBe(403);
  });

  it('serves a loopback Host in each of its forms', async () => {
    for (const host of ['localhost:5173', '127.0.0.1:5173', '[::1]:5173']) {
      const { handler } = middlewareOf();
      const res = responseDouble();
      await handler(
        requestDouble(
          { 'content-type': 'application/json', host },
          JSON.stringify({ op: 'list', collection: 'posts' })
        ),
        res
      );
      expect(res.statusCode).toBe(200);
    }
  });

  it('403s a request that states a cross-site relationship', async () => {
    const { handler } = middlewareOf();
    const res = responseDouble();
    await handler(
      requestDouble(
        { ...JSON_HEADERS, 'sec-fetch-site': 'cross-site' },
        JSON.stringify({ op: 'list', collection: 'posts' })
      ),
      res
    );
    expect(res.statusCode).toBe(403);
  });

  it('415s a request that is not JSON', async () => {
    const { handler } = middlewareOf();
    const res = responseDouble();
    await handler(
      requestDouble({ ...JSON_HEADERS, 'content-type': 'text/plain' }, '{}'),
      res
    );
    expect(res.statusCode).toBe(415);
  });

  it('415s a content type whose essence is not application/json', async () => {
    const { handler } = middlewareOf();
    const res = responseDouble();
    await handler(
      requestDouble(
        { ...JSON_HEADERS, 'content-type': 'application/json-patch+json' },
        JSON.stringify({ op: 'list', collection: 'posts' })
      ),
      res
    );
    expect(res.statusCode).toBe(415);
  });

  it('serves a content type that carries a parameter of its own', async () => {
    const { handler } = middlewareOf();
    const res = responseDouble();
    await handler(
      requestDouble(
        { ...JSON_HEADERS, 'content-type': 'Application/JSON; charset=utf-8' },
        JSON.stringify({ op: 'list', collection: 'posts' })
      ),
      res
    );
    expect(res.statusCode).toBe(200);
  });

  it('413s a body past the size cap, and then drops the request', async () => {
    const { handler } = middlewareOf();
    const res = responseDouble();
    const req = requestDouble(
      JSON_HEADERS,
      Array.from({ length: 6 }, () => 'a'.repeat(1024 * 1024))
    );
    await handler(req, res);
    expect(res.statusCode).toBe(413);
    expect(req.paused).toBe(true);
    expect(req.destroyed).toBe(true);
  });

  it('measures the body in bytes, and not in code units', async () => {
    const { handler } = middlewareOf();
    const res = responseDouble();
    await handler(
      requestDouble(JSON_HEADERS, '✓'.repeat(2 * 1024 * 1024)),
      res
    );
    expect(res.statusCode).toBe(413);
  });

  it('400s a damaged body', async () => {
    const { handler } = middlewareOf();
    const res = responseDouble();
    await handler(requestDouble(JSON_HEADERS, '{ not json'), res);
    expect(res.statusCode).toBe(400);
  });

  it('writes nothing when the socket is already destroyed', async () => {
    const { handler } = middlewareOf();
    const res = responseDouble();
    res.destroyed = true;
    await handler(requestDouble(JSON_HEADERS, '{ not json'), res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toBe('');
  });

  it('mounts at the configured url', () => {
    expect(middlewareOf('/__tina/content').route).toBe('/__tina/content');
  });

  // A socket failure rejects with whatever the stream emits, which need not be
  // an Error.
  it('answers a failure that is not an Error', async () => {
    const { handler } = middlewareOf();
    const res = responseDouble();
    const req = requestDouble(JSON_HEADERS);
    const pending = handler(req, res);
    queueMicrotask(() => req.emit('error', 'the socket reset'));
    await pending;
    expect(res.statusCode).toBe(400);
    expect(res.body).toBe('the socket reset');
  });
});

const TRANSFORM_MARK = '<!-- transformed by vite -->';

type Mounted = { route?: string; handler: Function };

const serverDouble = () => {
  const mounted: Mounted[] = [];
  const logs: string[] = [];
  return {
    mounted,
    logs,
    middlewares: {
      use: (first: unknown, second?: unknown) => {
        if (typeof first === 'function') {
          mounted.push({ handler: first as Function });
          return;
        }
        mounted.push({ route: first as string, handler: second as Function });
      },
    },
    config: { logger: { info: (message: string) => logs.push(message) } },
    transformIndexHtml: async (_url: string, html: string) =>
      `${html}${TRANSFORM_MARK}`,
  };
};

const configOf = (fields: { name: string; type: string }[]): ResolvedConfig =>
  asResolvedConfig({
    plugins: [
      definePlugin({ name: 'test:content', provides: ['content'] }),
      definePlugin({
        name: 'test:field:string',
        provides: ['field'],
        field: { type: 'string', contractVersion: 1 },
      }),
    ],
    schema: {
      collections: [
        { name: 'posts', path: 'content/posts', format: 'mdx', fields },
      ],
    },
  });

// Codegen looks for tina/config.ts on disk. The loader still hands over the
// config object, so the file only has to exist.
const bootServer = async (config: ResolvedConfig) => {
  await fs.mkdir(path.join(rootDir, 'tina'), { recursive: true });
  await fs.writeFile(
    path.join(rootDir, 'tina', 'config.ts'),
    'export default {}'
  );
  const plugin = tinaLocalDataLayerVitePlugin({ rootDir, config });
  const server = serverDouble();
  (plugin.configureServer as (s: unknown) => void)(server);
  await vi.waitFor(() => expect(server.logs.length).toBeGreaterThan(0));
  return { plugin, server };
};

const adminRequest = async (
  server: ReturnType<typeof serverDouble>,
  url: string
) => {
  const res = responseDouble();
  const next = vi.fn();
  await server.mounted[0].handler({ url, headers: {} }, res, next);
  return { res, next };
};

const adminHtmlPath = () => path.join(rootDir, 'public', 'admin', 'index.html');

describe('tinaLocalDataLayerVitePlugin dev codegen', () => {
  it('writes the admin shell and names each file it wrote', async () => {
    const { server } = await bootServer(
      configOf([{ name: 'title', type: 'string' }])
    );
    expect(server.logs.join('\n')).toContain('tina: wrote');
    await expect(fs.readFile(adminHtmlPath(), 'utf8')).resolves.toContain(
      '<div id="root">'
    );
  });

  // A schema that names a field type without a plugin must not stop the dev
  // server. The plugin reports the failure and serves content.
  it('reports a codegen failure and keeps the server running', async () => {
    const { server } = await bootServer(
      configOf([{ name: 'cover', type: 'image' }])
    );
    expect(server.logs.join('\n')).toContain('tina: codegen failed');
    expect(server.logs.join('\n')).toContain('image');
    expect(server.mounted.length).toBeGreaterThan(0);
  });

  it('names the files it changed when the schema moves on', async () => {
    await bootServer(configOf([{ name: 'title', type: 'string' }]));
    const { server } = await bootServer(
      configOf([
        { name: 'title', type: 'string' },
        { name: 'summary', type: 'string' },
      ])
    );
    expect(server.logs.join('\n')).toContain('tina: updated');
  });

  it('runs no codegen when the caller hands over collections alone', () => {
    const plugin = tinaLocalDataLayerVitePlugin({
      rootDir,
      collections: [POSTS],
    });
    const server = serverDouble();
    (plugin.configureServer as (s: unknown) => void)(server);
    expect(server.logs).toEqual([]);
    expect(server.mounted).toHaveLength(1);
    expect(server.mounted[0].route).toBe(DEFAULT_CONTENT_URL);
  });
});

describe('tinaLocalDataLayerVitePlugin admin route', () => {
  it('serves the admin shell through the html transform of vite', async () => {
    const { server } = await bootServer(
      configOf([{ name: 'title', type: 'string' }])
    );
    const { res, next } = await adminRequest(server, '/admin/');
    expect(res.headers['content-type']).toBe('text/html');
    expect(res.body).toContain(TRANSFORM_MARK);
    expect(next).not.toHaveBeenCalled();
  });

  it('serves the shell on each form of the admin route', async () => {
    const { server } = await bootServer(
      configOf([{ name: 'title', type: 'string' }])
    );
    for (const url of ['/admin', '/admin/', '/admin/index.html']) {
      const { res, next } = await adminRequest(server, url);
      expect(next).not.toHaveBeenCalled();
      expect(res.body).toContain(TRANSFORM_MARK);
    }
  });

  it('serves the shell for an admin route that carries a query', async () => {
    const { server } = await bootServer(
      configOf([{ name: 'title', type: 'string' }])
    );
    const { res, next } = await adminRequest(
      server,
      '/admin/?collection=posts'
    );
    expect(next).not.toHaveBeenCalled();
    expect(res.body).toContain(TRANSFORM_MARK);
  });

  it('passes a route that is not the admin route to the next handler', async () => {
    const { server } = await bootServer(
      configOf([{ name: 'title', type: 'string' }])
    );
    const { res, next } = await adminRequest(server, '/posts/hello');
    expect(next).toHaveBeenCalledWith();
    expect(res.body).toBe('');
  });

  it('passes a route that only starts with the admin route to the next handler', async () => {
    const { server } = await bootServer(
      configOf([{ name: 'title', type: 'string' }])
    );
    const { next } = await adminRequest(server, '/administrator');
    expect(next).toHaveBeenCalledWith();
  });

  it('hands the failure to the next handler when the shell is missing', async () => {
    const { server } = await bootServer(
      configOf([{ name: 'title', type: 'string' }])
    );
    await fs.rm(adminHtmlPath());
    const { next } = await adminRequest(server, '/admin/');
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it('serves a request that states no url', async () => {
    const { server } = await bootServer(
      configOf([{ name: 'title', type: 'string' }])
    );
    const res = responseDouble();
    const next = vi.fn();
    await server.mounted[0].handler({ headers: {} }, res, next);
    expect(next).toHaveBeenCalledWith();
  });
});

describe('tinaLocalDataLayerVitePlugin shutdown', () => {
  it('closes the data layer when the bundle closes', async () => {
    const close = vi.fn().mockResolvedValue(undefined);
    vi.mocked(createGraphQLPipeline).mockResolvedValue({
      execute: vi.fn().mockResolvedValue({ data: {} }),
      close,
    } as unknown as Awaited<ReturnType<typeof createGraphQLPipeline>>);

    const plugin = tinaLocalDataLayerVitePlugin({
      rootDir,
      collections: [POSTS],
    });
    const server = serverDouble();
    (plugin.configureServer as (s: unknown) => void)(server);

    const res = responseDouble();
    await server.mounted[0].handler(
      requestDouble(
        JSON_HEADERS,
        JSON.stringify({ op: 'graphql', query: '{ __typename }' })
      ),
      res
    );

    await (plugin.closeBundle as () => Promise<void>)();
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('closes a data layer that never booted a pipeline', async () => {
    const plugin = tinaLocalDataLayerVitePlugin({
      rootDir,
      collections: [POSTS],
    });
    await expect(
      (plugin.closeBundle as () => Promise<void>)()
    ).resolves.toBeUndefined();
  });
});

describe('tinaLocalDataLayerVitePlugin watch config', () => {
  it('ignores the collection folders, in posix form', () => {
    const plugin = tinaLocalDataLayerVitePlugin({
      rootDir,
      collections: [POSTS],
    });
    const config = (plugin.config as () => Record<string, never>)();
    const ignored = (
      config as unknown as {
        server: { watch: { ignored: string[] } };
      }
    ).server.watch.ignored;
    expect(ignored).toHaveLength(1);
    expect(ignored[0].endsWith('content/posts/**')).toBe(true);
    expect(ignored[0]).not.toContain('\\');
  });

  it('refuses a collection with no path before it configures anything', () => {
    expect(() =>
      tinaLocalDataLayerVitePlugin({
        rootDir,
        collections: [{ ...POSTS, path: undefined as unknown as string }],
      })
    ).toThrow(/content-collection-no-path/);
  });
});
