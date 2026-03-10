import path from 'path';
import fs from 'fs-extra';
import { Readable } from 'stream';
import { PathTraversalError } from '../../../../utils/path';
import { MediaModel, PathConfig, createMediaRouter } from './media';

describe('MediaModel (Vite dev server)', () => {
  let tmpDir: string;
  let config: PathConfig;

  beforeEach(async () => {
    tmpDir = path.join(
      process.env.TMPDIR || '/tmp',
      `tinacms-vite-media-${Date.now()}`
    );
    await fs.mkdirp(path.join(tmpDir, 'public', 'uploads'));
    config = {
      rootPath: tmpDir,
      apiURL: 'http://localhost:4001',
      publicFolder: 'public',
      mediaRoot: 'uploads',
    };
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  describe('listMedia', () => {
    it('lists files in a valid directory', async () => {
      const mediaDir = path.join(tmpDir, 'public', 'uploads');
      await fs.writeFile(path.join(mediaDir, 'photo.jpg'), 'fake-jpg');
      const model = new MediaModel(config);
      const result = await model.listMedia({ searchPath: '' });
      expect(result.files).toHaveLength(1);
      expect(result.files[0].filename).toBe('photo.jpg');
    });

    it('returns empty for non-existent path', async () => {
      const model = new MediaModel(config);
      const result = await model.listMedia({ searchPath: 'missing' });
      expect(result.files).toEqual([]);
      expect(result.directories).toEqual([]);
    });

    it('throws PathTraversalError for traversal in searchPath', async () => {
      const model = new MediaModel(config);
      await expect(
        model.listMedia({ searchPath: '../../../etc' })
      ).rejects.toThrow(PathTraversalError);
    });

    it('throws PathTraversalError for still-encoded traversal (safety net)', async () => {
      const model = new MediaModel(config);
      // Even if a caller forgets to decode, encoded traversal sequences
      // like %2e%2e (double-dot) and %2f (slash) are rejected as a safety net.
      await expect(
        model.listMedia({ searchPath: '%2e%2e/%2e%2e/%2e%2e/etc' })
      ).rejects.toThrow(PathTraversalError);
    });
  });

  describe('deleteMedia', () => {
    it('deletes a valid file', async () => {
      const mediaDir = path.join(tmpDir, 'public', 'uploads');
      const filePath = path.join(mediaDir, 'remove-me.txt');
      await fs.writeFile(filePath, 'bye');
      const model = new MediaModel(config);
      const result = await model.deleteMedia({ searchPath: 'remove-me.txt' });
      expect(result).toEqual({ ok: true });
      expect(await fs.pathExists(filePath)).toBe(false);
    });

    it('returns failure for non-existent file', async () => {
      const model = new MediaModel(config);
      const result = await model.deleteMedia({ searchPath: 'ghost.txt' });
      expect(result).toHaveProperty('ok', false);
    });

    it('throws PathTraversalError for traversal in searchPath', async () => {
      const model = new MediaModel(config);
      await expect(
        model.deleteMedia({ searchPath: '../../etc/passwd' })
      ).rejects.toThrow(PathTraversalError);
    });
  });
});

describe('createMediaRouter', () => {
  let tmpDir: string;
  let config: PathConfig;

  beforeEach(async () => {
    tmpDir = path.join(
      process.env.TMPDIR || '/tmp',
      `tinacms-vite-router-${Date.now()}`
    );
    await fs.mkdirp(path.join(tmpDir, 'public', 'uploads'));
    config = {
      rootPath: tmpDir,
      apiURL: 'http://localhost:4001',
      publicFolder: 'public',
      mediaRoot: 'uploads',
    };
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('returns handleList, handleDelete, handlePost functions', () => {
    const router = createMediaRouter(config);
    expect(typeof router.handleList).toBe('function');
    expect(typeof router.handleDelete).toBe('function');
    expect(typeof router.handlePost).toBe('function');
  });

  describe('handleList', () => {
    it('returns 403 for path traversal', async () => {
      const router = createMediaRouter(config);
      // Use %2f-encoded slashes so the URL constructor doesn't normalize
      // away the ".." segments; decodeURIComponent in listMedia decodes them.
      const req = {
        url: '/media/list/..%2f..%2f..%2fetc',
      };
      let statusCode: number = 0;
      let body: string = '';
      const res = {
        set statusCode(code: number) {
          statusCode = code;
        },
        end(data: string) {
          body = data;
        },
      };
      await router.handleList(req, res);
      expect(statusCode).toBe(403);
      expect(JSON.parse(body)).toHaveProperty('error');
      expect(JSON.parse(body).error).toContain('Path traversal detected');
    });
  });

  describe('handleDelete', () => {
    it('returns 403 for path traversal', async () => {
      const router = createMediaRouter(config);
      const req = {
        url: '/media/../../etc/passwd',
      };
      let statusCode: number = 0;
      let body: string = '';
      const res = {
        set statusCode(code: number) {
          statusCode = code;
        },
        end(data: string) {
          body = data;
        },
      };
      await router.handleDelete(req as any, res as any);
      expect(statusCode).toBe(403);
      expect(JSON.parse(body)).toHaveProperty('error');
      expect(JSON.parse(body).error).toContain('Path traversal detected');
    });

    it('returns 403 for empty path (media root)', async () => {
      const router = createMediaRouter(config);
      const req = { url: '/media/' };
      let statusCode: number = 0;
      let body: string = '';
      const res = {
        set statusCode(code: number) {
          statusCode = code;
        },
        end(data: string) {
          body = data;
        },
      };
      await router.handleDelete(req as any, res as any);
      // resolveStrictlyWithinBase rejects exact base match
      expect(statusCode).toBe(403);
    });
  });

  describe('handlePost', () => {
    /**
     * Builds a minimal multipart/form-data request stream that busboy can
     * parse.  The stream contains a single file field named "file".
     */
    function makeMultipartReq(url: string, fileContent: string = 'hello') {
      const boundary = '----TestBoundary' + Date.now();
      const payload = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="file"; filename="test.txt"',
        'Content-Type: text/plain',
        '',
        fileContent,
        `--${boundary}--`,
        '',
      ].join('\r\n');

      const stream = new Readable({
        read() {
          this.push(Buffer.from(payload));
          this.push(null);
        },
      }) as any;
      stream.url = url;
      stream.headers = {
        'content-type': `multipart/form-data; boundary=${boundary}`,
      };
      return stream;
    }

    it('returns 403 for path traversal in upload path', async () => {
      const router = createMediaRouter(config);
      const req = makeMultipartReq('/media/upload/../../etc/evil.txt');
      let statusCode: number = 0;
      let body: string = '';
      const res = {
        set statusCode(code: number) {
          statusCode = code;
        },
        end(data: string) {
          body = data;
        },
      } as any;

      await new Promise<void>((resolve) => {
        const origEnd = res.end;
        res.end = (data: string) => {
          origEnd(data);
          resolve();
        };
        router.handlePost(req, res);
      });

      expect(statusCode).toBe(403);
      expect(JSON.parse(body)).toHaveProperty('error');
      expect(JSON.parse(body).error).toContain('Path traversal detected');
    });

    it('returns 200 for a valid upload path', async () => {
      const router = createMediaRouter(config);
      const req = makeMultipartReq(
        '/media/upload/test-upload.txt',
        'file data'
      );
      let statusCode: number = 0;
      let body: string = '';
      const res = {
        set statusCode(code: number) {
          statusCode = code;
        },
        end(data: string) {
          body = data;
        },
      } as any;

      await new Promise<void>((resolve) => {
        const origEnd = res.end;
        res.end = (data: string) => {
          origEnd(data);
          // Small delay for the file stream to flush
          setTimeout(resolve, 50);
        };
        router.handlePost(req, res);
      });

      expect(statusCode).toBe(200);
      expect(JSON.parse(body)).toEqual({ success: true });
      // Verify the file was actually written
      const uploadedFile = path.join(
        tmpDir,
        'public',
        'uploads',
        'test-upload.txt'
      );
      expect(await fs.pathExists(uploadedFile)).toBe(true);
    });

    it('returns 403 for encoded traversal in upload path', async () => {
      const router = createMediaRouter(config);
      const req = makeMultipartReq(
        '/media/upload/..%2f..%2f..%2fetc%2fevil.txt'
      );
      let statusCode: number = 0;
      let body: string = '';
      const res = {
        set statusCode(code: number) {
          statusCode = code;
        },
        end(data: string) {
          body = data;
        },
      } as any;

      await new Promise<void>((resolve) => {
        const origEnd = res.end;
        res.end = (data: string) => {
          origEnd(data);
          resolve();
        };
        router.handlePost(req, res);
      });

      expect(statusCode).toBe(403);
      expect(JSON.parse(body)).toHaveProperty('error');
      expect(JSON.parse(body).error).toContain('Path traversal detected');
    });
  });
});
