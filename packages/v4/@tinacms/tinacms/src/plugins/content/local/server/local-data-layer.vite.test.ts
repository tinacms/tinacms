import { EventEmitter } from 'node:events';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CollectionSchema } from '../../../../core/schema/types';
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
