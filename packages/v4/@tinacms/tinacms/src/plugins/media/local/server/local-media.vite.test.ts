import { EventEmitter } from 'node:events';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_MEDIA_URL } from '../../../../core/media/contract';
import { MAX_MEDIA_UPLOAD_BYTES } from '../../../../core/request-body';
import type { CollectionSchema } from '../../../../core/schema/types';
import { tinaLocalDataLayerVitePlugin } from '../../../content/local/server/local-data-layer.vite';

vi.mock('../../../content/local/graphql/graphql-pipeline', () => ({
  createGraphQLPipeline: vi.fn(),
}));

const POSTS: CollectionSchema = {
  name: 'posts',
  label: 'Posts',
  path: 'content/posts',
  format: 'mdx',
  fields: [{ type: 'string', name: 'title', label: 'Title' }],
};

const SAME_ORIGIN = {
  host: 'localhost:5173',
  origin: 'http://localhost:5173',
};

let rootDir: string;

beforeEach(async () => {
  rootDir = await fs.mkdtemp(path.join(tmpdir(), 'tina-media-vite-'));
});

afterEach(async () => {
  await fs.rm(rootDir, { recursive: true, force: true });
});

const requestDouble = (
  url: string,
  headers: Record<string, string>,
  chunks: (string | Buffer)[]
) => {
  const req = Object.assign(new EventEmitter(), {
    url,
    headers,
    destroyed: false,
    setEncoding: () => {},
    pause: () => {},
    destroy() {
      req.destroyed = true;
    },
  });
  queueMicrotask(() => {
    for (const chunk of chunks) req.emit('data', chunk);
    req.emit('end');
  });
  return req;
};

const responseDouble = () => {
  const chunks: string[] = [];
  return {
    statusCode: 200,
    destroyed: false,
    setHeader: () => {},
    end(chunk?: string, callback?: () => void) {
      if (chunk !== undefined) chunks.push(chunk);
      callback?.();
    },
    get body() {
      return chunks.join('');
    },
  };
};

const mediaMiddleware = () => {
  const plugin = tinaLocalDataLayerVitePlugin({
    rootDir,
    collections: [POSTS],
  });
  const mounted = new Map<string, Function>();
  const server = {
    middlewares: {
      use: (route: string, handler: Function) => mounted.set(route, handler),
    },
  };
  (plugin.configureServer as (s: unknown) => void)(server);
  const handler = mounted.get(DEFAULT_MEDIA_URL);
  if (!handler) throw new Error('The plugin mounted no media middleware.');
  return handler;
};

const multipartOf = async (form: FormData) => {
  const request = new Request('http://localhost/upload', {
    method: 'POST',
    body: form,
  });
  return {
    contentType: request.headers.get('content-type') ?? '',
    body: Buffer.from(await request.arrayBuffer()),
  };
};

const upload = async (headers: Record<string, string> = SAME_ORIGIN) => {
  const form = new FormData();
  form.append('folder', 'posts');
  form.append('file', new File(['jpeg'], 'hero.jpg'));
  const { contentType, body } = await multipartOf(form);
  const res = responseDouble();
  await mediaMiddleware()(
    requestDouble('/upload', { ...headers, 'content-type': contentType }, [
      body,
    ]),
    res
  );
  return res;
};

describe('local media endpoint', () => {
  it('saves a same-origin multipart upload under public/uploads', async () => {
    const res = await upload();
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ path: 'posts/hero.jpg' });
    expect(
      await fs.readFile(
        path.join(rootDir, 'public/uploads/posts/hero.jpg'),
        'utf8'
      )
    ).toBe('jpeg');
  });

  it('403s a cross-origin upload, because multipart skips the preflight', async () => {
    const res = await upload({
      host: 'localhost:5173',
      origin: 'https://evil.example',
    });
    expect(res.statusCode).toBe(403);
    await expect(
      fs.access(path.join(rootDir, 'public/uploads'))
    ).rejects.toThrow();
  });

  it('403s an upload that states a cross-site relationship', async () => {
    const res = await upload({
      ...SAME_ORIGIN,
      'sec-fetch-site': 'cross-site',
    });
    expect(res.statusCode).toBe(403);
  });

  it('415s an upload that is not multipart', async () => {
    const res = responseDouble();
    await mediaMiddleware()(
      requestDouble(
        '/upload',
        { ...SAME_ORIGIN, 'content-type': 'application/json' },
        ['{}']
      ),
      res
    );
    expect(res.statusCode).toBe(415);
  });

  it('413s an upload over the size limit', async () => {
    const res = responseDouble();
    await mediaMiddleware()(
      requestDouble(
        '/upload',
        {
          ...SAME_ORIGIN,
          'content-type': 'multipart/form-data; boundary=x',
        },
        [Buffer.alloc(MAX_MEDIA_UPLOAD_BYTES + 1)]
      ),
      res
    );
    expect(res.statusCode).toBe(413);
  });

  it('serves a JSON list op', async () => {
    await upload();
    const res = responseDouble();
    await mediaMiddleware()(
      requestDouble(
        '/',
        { ...SAME_ORIGIN, 'content-type': 'application/json' },
        [JSON.stringify({ op: 'list', folder: 'posts' })]
      ),
      res
    );
    expect(JSON.parse(res.body)).toEqual({
      items: [{ path: 'posts/hero.jpg', kind: 'file' }],
    });
  });

  it('400s a delete outside the media folder', async () => {
    const res = responseDouble();
    await mediaMiddleware()(
      requestDouble(
        '/',
        { ...SAME_ORIGIN, 'content-type': 'application/json' },
        [JSON.stringify({ op: 'delete', path: '../../package.json' })]
      ),
      res
    );
    expect(res.statusCode).toBe(400);
    expect(res.body).toMatch(/media-path-outside-root/);
  });
});
