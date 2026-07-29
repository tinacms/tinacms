// The Vite host is a published subpath (`./local-data-layer/vite`), so its guards and
// its watch config are a contract. The Connect handler is a plain function of (req, res),
// which means none of this needs a dev server: the tests call it with a request double
// and read what it wrote back.

import { EventEmitter } from 'node:events';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CollectionSchema } from '../../../core/schema/types';
import { tinaLocalDataLayerVitePlugin } from './local-data-layer.vite';

vi.mock('./graphql-pipeline', () => ({ createGraphQLPipeline: vi.fn() }));

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

// Connect hands the middleware a Node IncomingMessage. Only the headers, the encoding
// and the data/end/error events are read, so an EventEmitter carries all of it.
const requestDouble = (headers: Record<string, string>, body?: string) => {
  const req = Object.assign(new EventEmitter(), {
    headers,
    setEncoding: () => {},
  });
  if (body !== undefined) {
    queueMicrotask(() => {
      req.emit('data', body);
      req.emit('end');
    });
  }
  return req as never;
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
    end(chunk?: string) {
      if (chunk !== undefined) chunks.push(chunk);
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

  it('415s a request that is not JSON', async () => {
    const { handler } = middlewareOf();
    const res = responseDouble();
    await handler(
      requestDouble({ ...JSON_HEADERS, 'content-type': 'text/plain' }, '{}'),
      res
    );
    expect(res.statusCode).toBe(415);
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

  // The watch config keeps a `folder ? … : []` branch that this can never reach: the
  // data layer is built first, and it refuses a collection with no path outright.
  it('refuses a collection with no path before it configures anything', () => {
    expect(() =>
      tinaLocalDataLayerVitePlugin({
        rootDir,
        collections: [{ ...POSTS, path: undefined as unknown as string }],
      })
    ).toThrow(/content-collection-no-path/);
  });
});
