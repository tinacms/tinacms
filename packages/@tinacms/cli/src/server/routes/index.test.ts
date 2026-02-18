import path from 'path';
import fs from 'fs-extra';

type RouteHandler = (req: any, res: any, next?: any) => Promise<void>;
const registeredRoutes: Record<
  string,
  { path: string; handler: RouteHandler }[]
> = {
  get: [],
  delete: [],
  post: [],
};

const mockRouter = {
  get: jest.fn((routePath: string, handler: RouteHandler) => {
    registeredRoutes.get.push({ path: routePath, handler });
  }),
  delete: jest.fn((routePath: string, handler: RouteHandler) => {
    registeredRoutes.delete.push({ path: routePath, handler });
  }),
  post: jest.fn((routePath: string, handler: RouteHandler) => {
    registeredRoutes.post.push({ path: routePath, handler });
  }),
};

jest.mock('express', () => ({
  Router: () => mockRouter,
}));

// Captures the storage callbacks (destination, filename) passed to multer.diskStorage()
let capturedStorageOpts: {
  destination: (req: any, file: any, cb: any) => void;
  filename: (req: any, file: any, cb: any) => void;
} | null = null;

const mockUploadSingle = jest.fn();
const mockMulter: any = jest.fn(() => ({
  single: mockUploadSingle,
}));
mockMulter.diskStorage = jest.fn((opts: any) => {
  capturedStorageOpts = opts;
  return opts;
});
mockMulter.MulterError = class MulterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MulterError';
  }
};

jest.mock('multer', () => mockMulter);

import { PathTraversalError } from '../../utils/path';
import { createMediaRouter } from './index';

function mockRes() {
  const res: any = {
    _status: 200,
    _json: undefined as any,
    status(code: number) {
      res._status = code;
      return res;
    },
    json(data: any) {
      res._json = data;
      return res;
    },
  };
  return res;
}

describe('Express createMediaRouter', () => {
  let tmpDir: string;

  beforeEach(async () => {
    registeredRoutes.get = [];
    registeredRoutes.delete = [];
    registeredRoutes.post = [];

    tmpDir = path.join(
      process.env.TMPDIR || '/tmp',
      `tinacms-express-routes-${Date.now()}`
    );
    await fs.mkdirp(path.join(tmpDir, 'public', 'uploads'));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  const makeConfig = (dir: string) => ({
    rootPath: dir,
    publicFolder: 'public',
    mediaRoot: 'uploads',
  });

  describe('GET /list/*', () => {
    it('returns 403 when listing with a traversal path', async () => {
      createMediaRouter(makeConfig(tmpDir));

      const listRoute = registeredRoutes.get.find((r) => r.path === '/list/*');
      expect(listRoute).toBeDefined();

      const req = { params: ['../../../etc'], query: {} };
      const res = mockRes();

      await listRoute!.handler(req, res);

      expect(res._status).toBe(403);
      expect(res._json).toHaveProperty('error');
      expect(res._json.error).toContain('Path traversal detected');
    });

    it('returns media listing for a valid path', async () => {
      const mediaDir = path.join(tmpDir, 'public', 'uploads');
      await fs.writeFile(path.join(mediaDir, 'image.png'), 'fake');

      createMediaRouter(makeConfig(tmpDir));

      const listRoute = registeredRoutes.get.find((r) => r.path === '/list/*');
      const req = { params: [''], query: {} };
      const res = mockRes();

      await listRoute!.handler(req, res);

      expect(res._status).toBe(200);
      expect(res._json).toHaveProperty('files');
      expect(res._json.files).toHaveLength(1);
      expect(res._json.files[0].filename).toBe('image.png');
    });
  });

  describe('DELETE /*', () => {
    it('returns 403 when deleting with a traversal path', async () => {
      createMediaRouter(makeConfig(tmpDir));

      const deleteRoute = registeredRoutes.delete.find((r) => r.path === '/*');
      expect(deleteRoute).toBeDefined();

      const req = { params: ['../../etc/passwd'] };
      const res = mockRes();

      await deleteRoute!.handler(req, res);

      expect(res._status).toBe(403);
      expect(res._json).toHaveProperty('error');
      expect(res._json.error).toContain('Path traversal detected');
    });

    it('returns success for a valid delete', async () => {
      const mediaDir = path.join(tmpDir, 'public', 'uploads');
      const file = path.join(mediaDir, 'removable.txt');
      await fs.writeFile(file, 'data');

      createMediaRouter(makeConfig(tmpDir));

      const deleteRoute = registeredRoutes.delete.find((r) => r.path === '/*');
      const req = { params: ['removable.txt'] };
      const res = mockRes();

      await deleteRoute!.handler(req, res);

      expect(res._status).toBe(200);
      expect(res._json).toEqual({ ok: true });
      expect(await fs.pathExists(file)).toBe(false);
    });
  });

  describe('POST /upload/* (multer filename validation)', () => {
    it('rejects traversal in the multer filename callback', () => {
      createMediaRouter(makeConfig(tmpDir));
      expect(capturedStorageOpts).not.toBeNull();

      const cb = jest.fn();
      capturedStorageOpts!.filename({ params: ['../../etc/shadow'] }, {}, cb);

      expect(cb).toHaveBeenCalledTimes(1);
      const [err, filename] = cb.mock.calls[0];
      expect(err).toBeInstanceOf(PathTraversalError);
      expect(filename).toBeUndefined();
    });

    it('allows a valid filename in the multer callback', () => {
      createMediaRouter(makeConfig(tmpDir));

      const cb = jest.fn();
      capturedStorageOpts!.filename({ params: ['my-photo.jpg'] }, {}, cb);

      expect(cb).toHaveBeenCalledTimes(1);
      const [err, filename] = cb.mock.calls[0];
      expect(err).toBeNull();
      expect(filename).toBe('my-photo.jpg');
    });

    it('sets destination to the media folder', () => {
      createMediaRouter(makeConfig(tmpDir));

      const cb = jest.fn();
      capturedStorageOpts!.destination({}, {}, cb);

      expect(cb).toHaveBeenCalledWith(
        null,
        path.join(tmpDir, 'public', 'uploads')
      );
    });
  });

  describe('POST /upload/* route handler', () => {
    // Wires the mock multer middleware to invoke the real filename callback,
    // so assertPathWithinBase runs as production code.
    function wireUploadMiddleware() {
      mockUploadSingle.mockReturnValue(
        jest.fn((req: any, _res: any, done: (err: any) => void) => {
          capturedStorageOpts!.filename(req, {}, (err: any) => {
            done(err || null);
          });
        })
      );
    }

    it('returns 500 when upload filename triggers path traversal', async () => {
      createMediaRouter(makeConfig(tmpDir));
      wireUploadMiddleware();

      registeredRoutes.post = [];
      createMediaRouter(makeConfig(tmpDir));

      const postRoute = registeredRoutes.post.find(
        (r) => r.path === '/upload/*'
      );
      expect(postRoute).toBeDefined();

      const req = { params: ['../../etc/shadow'] };
      const res = mockRes();

      await postRoute!.handler(req, res);

      expect(res._status).toBe(500);
      expect(res._json).toHaveProperty('message');
      expect(res._json.message).toContain('Path traversal detected');
    });

    it('returns success for a valid upload filename', async () => {
      createMediaRouter(makeConfig(tmpDir));
      wireUploadMiddleware();

      registeredRoutes.post = [];
      createMediaRouter(makeConfig(tmpDir));

      const postRoute = registeredRoutes.post.find(
        (r) => r.path === '/upload/*'
      );
      const req = { params: ['my-photo.jpg'] };
      const res = mockRes();

      await postRoute!.handler(req, res);

      expect(res._status).toBe(200);
      expect(res._json).toEqual({ success: true });
    });
  });
});
