import { devServerEndPointsPlugin } from './plugins';

/**
 * Middleware-layer regression test for the cross-origin upload flaw.
 *
 * The `cors` package only controls response headers — it does NOT reject
 * disallowed origins server-side. Because multipart uploads are "simple"
 * requests that skip the CORS preflight, an attacker page could otherwise
 * drive a state-changing request to completion (writing files into the media
 * root) even though the browser can't read the response.
 *
 * These tests exercise the real request middleware registered by
 * `devServerEndPointsPlugin` and assert that disallowed cross-origin
 * state-changing requests are rejected with a 403 *before* they reach the
 * media/searchIndex handlers.
 */

// jest.mock factories may only reference vars prefixed with `mock`.
const mockHandlePost = jest.fn(async (_req: any, res: any) => {
  res.statusCode = 200;
  res.end(JSON.stringify({ success: true }));
});
const mockHandleDelete = jest.fn(async (_req: any, res: any) => {
  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true }));
});
const mockHandleList = jest.fn();
const mockSearchPut = jest.fn(async (_req: any, res: any) => {
  res.statusCode = 200;
  res.end('{}');
});

jest.mock('../commands/dev-command/server/media', () => ({
  createMediaRouter: () => ({
    handlePost: mockHandlePost,
    handleDelete: mockHandleDelete,
    handleList: mockHandleList,
  }),
  parseMediaFolder: (s: string) => s,
}));

jest.mock('../commands/dev-command/server/searchIndex', () => ({
  createSearchIndexRouter: () => ({
    put: mockSearchPut,
    get: jest.fn(),
    del: jest.fn(),
  }),
}));

// Avoid pulling the heavy graphql package into this unit test. `virtual` is
// required because the workspace package isn't resolvable from this test's
// module graph without a build.
jest.mock(
  '@tinacms/graphql',
  () => ({ resolve: jest.fn(async () => ({ data: {} })) }),
  { virtual: true }
);

// Reference to the mocked resolver (same module instance plugins.ts uses).
import { resolve as gqlResolve } from '@tinacms/graphql';
const mockGqlResolve = gqlResolve as unknown as jest.Mock;

type FakeRes = {
  statusCode: number;
  ended: boolean;
  body?: string;
  end: (body?: string) => void;
};

const makeRes = (): FakeRes => ({
  statusCode: 200,
  ended: false,
  end(body?: string) {
    this.ended = true;
    this.body = body;
  },
});

const makeConfigManager = (allowedOrigins?: (string | RegExp)[]) =>
  ({
    rootPath: '/tmp/project-root',
    config: {
      media: { tina: { publicFolder: 'public', mediaRoot: 'uploads' } },
      server: { allowedOrigins },
    },
  }) as any;

/**
 * Build the plugin and return its request-handling middleware (the last
 * middleware registered via `server.middlewares.use`, after `cors` and
 * `bodyParser`).
 */
const getRequestMiddleware = (allowedOrigins?: (string | RegExp)[]) => {
  const plugin = devServerEndPointsPlugin({
    configManager: makeConfigManager(allowedOrigins),
    apiURL: 'http://localhost:4001',
    database: {} as any,
    searchIndex: {},
    databaseLock: async (fn) => fn(),
  });
  const middlewares: Function[] = [];
  const server: any = {
    middlewares: { use: (fn: Function) => middlewares.push(fn) },
  };
  // @ts-ignore - configureServer only needs the `middlewares` shape here.
  plugin.configureServer(server);
  return middlewares[middlewares.length - 1];
};

const invoke = async (
  mw: Function,
  req: {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    body?: any;
  }
) => {
  const res = makeRes();
  const next = jest.fn();
  await mw({ method: 'GET', headers: {}, ...req }, res, next);
  return { res, next };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('devServerEndPointsPlugin cross-origin gate', () => {
  describe('disallowed cross-origin state-changing requests', () => {
    it('rejects POST /media/upload with 403 before reaching the handler', async () => {
      const mw = getRequestMiddleware();
      const { res, next } = await invoke(mw, {
        url: '/media/upload/poc.txt',
        method: 'POST',
        headers: { origin: 'http://evil.test:8000' },
      });

      expect(res.statusCode).toBe(403);
      expect(res.body).toContain('Origin not allowed');
      expect(mockHandlePost).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('rejects cross-origin DELETE /media before reaching the handler', async () => {
      const mw = getRequestMiddleware();
      const { res } = await invoke(mw, {
        url: '/media/uploads/poc.txt',
        method: 'DELETE',
        headers: { origin: 'https://evil.com' },
      });

      expect(res.statusCode).toBe(403);
      expect(mockHandleDelete).not.toHaveBeenCalled();
    });

    it('rejects cross-origin POST /searchIndex before reaching the handler', async () => {
      const mw = getRequestMiddleware();
      const { res } = await invoke(mw, {
        url: '/searchIndex',
        method: 'POST',
        headers: { origin: 'https://evil.com' },
      });

      expect(res.statusCode).toBe(403);
      expect(mockSearchPut).not.toHaveBeenCalled();
    });

    it('rejects cross-origin POST /graphql before reaching the handler', async () => {
      const mw = getRequestMiddleware();
      const { res } = await invoke(mw, {
        url: '/graphql',
        method: 'POST',
        headers: { origin: 'https://evil.com' },
        body: { query: 'mutation { addPendingDocument }', variables: {} },
      });

      expect(res.statusCode).toBe(403);
      expect(mockGqlResolve).not.toHaveBeenCalled();
    });
  });

  describe('allowed requests reach the upload handler', () => {
    it('allows a request with no Origin header (curl / same-origin)', async () => {
      const mw = getRequestMiddleware();
      const { res } = await invoke(mw, {
        url: '/media/upload/ok.txt',
        method: 'POST',
        headers: {},
      });

      expect(res.statusCode).not.toBe(403);
      expect(mockHandlePost).toHaveBeenCalledTimes(1);
    });

    it('allows a localhost Origin', async () => {
      const mw = getRequestMiddleware();
      const { res } = await invoke(mw, {
        url: '/media/upload/ok.txt',
        method: 'POST',
        headers: { origin: 'http://localhost:3000' },
      });

      expect(res.statusCode).not.toBe(403);
      expect(mockHandlePost).toHaveBeenCalledTimes(1);
    });

    it('allows an Origin configured via server.allowedOrigins', async () => {
      const mw = getRequestMiddleware(['https://my-codespace.github.dev']);
      const { res } = await invoke(mw, {
        url: '/media/upload/ok.txt',
        method: 'POST',
        headers: { origin: 'https://my-codespace.github.dev' },
      });

      expect(res.statusCode).not.toBe(403);
      expect(mockHandlePost).toHaveBeenCalledTimes(1);
    });

    it('still blocks a disallowed Origin even when allowedOrigins is set', async () => {
      const mw = getRequestMiddleware(['https://my-codespace.github.dev']);
      const { res } = await invoke(mw, {
        url: '/media/upload/poc.txt',
        method: 'POST',
        headers: { origin: 'http://evil.test:8000' },
      });

      expect(res.statusCode).toBe(403);
      expect(mockHandlePost).not.toHaveBeenCalled();
    });

    it('allows a no-Origin POST /graphql to reach the resolver', async () => {
      const mw = getRequestMiddleware();
      const { res } = await invoke(mw, {
        url: '/graphql',
        method: 'POST',
        headers: {},
        body: { query: '{ __typename }', variables: {} },
      });

      expect(res.statusCode).not.toBe(403);
      expect(mockGqlResolve).toHaveBeenCalledTimes(1);
    });

    it('allows a localhost POST /graphql to reach the resolver', async () => {
      const mw = getRequestMiddleware();
      const { res } = await invoke(mw, {
        url: '/graphql',
        method: 'POST',
        headers: { origin: 'http://localhost:3000' },
        body: { query: '{ __typename }', variables: {} },
      });

      expect(res.statusCode).not.toBe(403);
      expect(mockGqlResolve).toHaveBeenCalledTimes(1);
    });

    it('does not gate GET /graphql (read), even cross-origin', async () => {
      const mw = getRequestMiddleware();
      const { res } = await invoke(mw, {
        url: '/graphql',
        method: 'GET',
        headers: { origin: 'https://evil.com' },
        body: { query: '{ __typename }', variables: {} },
      });

      expect(res.statusCode).not.toBe(403);
      expect(mockGqlResolve).toHaveBeenCalledTimes(1);
    });
  });
});
