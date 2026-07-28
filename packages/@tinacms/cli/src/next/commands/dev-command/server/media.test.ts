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

    it('returns all directories on the first page and paginates files', async () => {
      const base = path.join(tmpDir, 'public', 'uploads');
      for (let i = 0; i < 5; i++) {
        await fs.mkdirp(path.join(base, `dir-${i}`));
      }
      for (let i = 0; i < 10; i++) {
        await fs.writeFile(
          path.join(base, `file-${String(i).padStart(2, '0')}.png`),
          'x'
        );
      }
      const model = new MediaModel(config);

      const page1 = await model.listMedia({ searchPath: '', limit: '4' });
      expect(page1.directories).toHaveLength(5);
      expect(page1.files).toHaveLength(4);
      expect(page1.cursor).toBe('4');

      const page2 = await model.listMedia({
        searchPath: '',
        limit: '4',
        cursor: '4',
      });
      expect(page2.directories).toEqual([]);
      expect(page2.files).toHaveLength(4);
    });
  });

  describe('listMedia search', () => {
    const seed = async () => {
      const base = path.join(tmpDir, 'public', 'uploads');
      await fs.mkdirp(path.join(base, 'nested', 'deep'));
      await fs.writeFile(path.join(base, 'llama.png'), 'x');
      await fs.writeFile(path.join(base, 'cat.png'), 'x');
      await fs.writeFile(path.join(base, 'nested', 'llama-baby.png'), 'x');
      await fs.writeFile(path.join(base, 'nested', 'deep', 'LLAMA.jpg'), 'x');
    };

    it('matches file paths recursively and suppresses directories', async () => {
      await seed();
      const model = new MediaModel(config);
      const result = await model.listMedia({ searchPath: '', search: 'llama' });
      const names = result.files.map((f) => f.filename).sort();
      expect(names).toEqual([
        'llama.png',
        'nested/deep/LLAMA.jpg',
        'nested/llama-baby.png',
      ]);
      expect(result.directories).toEqual([]);
    });

    it('matches a directory name against the files beneath it', async () => {
      await seed();
      const model = new MediaModel(config);
      const result = await model.listMedia({ searchPath: '', search: 'deep' });
      const names = result.files.map((f) => f.filename);
      expect(names).toEqual(['nested/deep/LLAMA.jpg']);
    });

    it('paginates results with limit and cursor', async () => {
      const base = path.join(tmpDir, 'public', 'uploads');
      for (let i = 0; i < 25; i++) {
        await fs.writeFile(
          path.join(base, `match-${String(i).padStart(2, '0')}.png`),
          'x'
        );
      }
      const model = new MediaModel(config);

      const page1 = await model.listMedia({
        searchPath: '',
        search: 'match',
        limit: '10',
      });
      expect(page1.files).toHaveLength(10);
      expect(page1.files[0].filename).toBe('match-00.png');
      expect(page1.cursor).toBe('10');

      const page3 = await model.listMedia({
        searchPath: '',
        search: 'match',
        limit: '10',
        cursor: page1.cursor as string,
      });
      expect(page3.files[0].filename).toBe('match-10.png');

      const last = await model.listMedia({
        searchPath: '',
        search: 'match',
        limit: '10',
        cursor: '20',
      });
      expect(last.files).toHaveLength(5);
      expect(last.cursor).toBeNull();
    });

    it('returns a structured result instead of throwing on a broken symlink', async () => {
      await seed();
      const base = path.join(tmpDir, 'public', 'uploads');
      await fs.symlink(path.join(tmpDir, 'gone'), path.join(base, 'dangling'));
      const model = new MediaModel(config);
      const result = await model.listMedia({ searchPath: '', search: 'llama' });
      expect(result.files).toHaveLength(3);
    });

    it('terminates on a symlink cycle inside the media root', async () => {
      await seed();
      const base = path.join(tmpDir, 'public', 'uploads');
      await fs.symlink(base, path.join(base, 'loop'), 'dir');
      const model = new MediaModel(config);
      const result = await model.listMedia({ searchPath: '', search: 'llama' });
      expect(result.files).toHaveLength(3);
    });

    it('keeps matches from readable folders when a nested folder cannot be read', async () => {
      await seed();
      const realReaddir = fs.readdir;
      const spy = jest
        .spyOn(fs, 'readdir')
        .mockImplementation((dirPath: any, ...rest: any[]) =>
          typeof dirPath === 'string' && dirPath.endsWith('nested')
            ? Promise.reject(new Error('EACCES: permission denied'))
            : (realReaddir as any).call(fs, dirPath, ...rest)
        );
      try {
        const result = await new MediaModel(config).listMedia({
          searchPath: '',
          search: 'llama',
        });
        expect(result.files.map((f) => f.filename)).toEqual(['llama.png']);
        expect(result.error).toBeUndefined();
      } finally {
        spy.mockRestore();
      }
    });

    it('is case-insensitive', async () => {
      await seed();
      const model = new MediaModel(config);
      const result = await model.listMedia({ searchPath: '', search: 'LLAMA' });
      expect(result.files).toHaveLength(3);
    });

    it('scopes to the requested directory with dir-relative filenames', async () => {
      await seed();
      const model = new MediaModel(config);
      const result = await model.listMedia({
        searchPath: 'nested',
        search: 'llama',
      });
      const names = result.files.map((f) => f.filename).sort();
      expect(names).toEqual(['deep/LLAMA.jpg', 'llama-baby.png']);
    });

    it('prefixes src with the media root', async () => {
      await seed();
      const model = new MediaModel(config);
      const result = await model.listMedia({ searchPath: '', search: 'cat' });
      expect(result.files[0].src).toBe('/uploads/cat.png');
    });

    it('returns empty when nothing matches', async () => {
      await seed();
      const model = new MediaModel(config);
      const result = await model.listMedia({ searchPath: '', search: 'zzz' });
      expect(result.files).toEqual([]);
      expect(result.directories).toEqual([]);
    });
  });

  describe('symlink traversal', () => {
    let outsideDir: string;

    beforeEach(async () => {
      outsideDir = path.join(
        process.env.TMPDIR || '/tmp',
        `tina-outside-vite-${Date.now()}`
      );
      await fs.mkdirp(outsideDir);
      await fs.writeFile(path.join(outsideDir, 'secret.txt'), 'sensitive');
      const mediaDir = path.join(tmpDir, 'public', 'uploads');
      await fs.symlink(outsideDir, path.join(mediaDir, 'escape'));
    });

    afterEach(async () => {
      await fs.remove(outsideDir);
    });

    it('listMedia rejects symlink escaping media root', async () => {
      const model = new MediaModel(config);
      await expect(model.listMedia({ searchPath: 'escape' })).rejects.toThrow(
        PathTraversalError
      );
    });

    it('deleteMedia rejects symlink escaping media root', async () => {
      const model = new MediaModel(config);
      await expect(
        model.deleteMedia({ searchPath: 'escape/secret.txt' })
      ).rejects.toThrow(PathTraversalError);
    });

    it('search does not follow a symlink escaping the media root', async () => {
      const model = new MediaModel(config);
      const result = await model.listMedia({
        searchPath: '',
        search: 'secret',
      });
      expect(result.files).toEqual([]);
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
