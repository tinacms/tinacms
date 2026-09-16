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

  describe('listMedia ext filter', () => {
    const seed = async (names: string[]) => {
      const dir = path.join(tmpDir, 'public', 'uploads');
      for (const name of names) await fs.writeFile(path.join(dir, name), 'x');
      return new MediaModel(config);
    };

    it('returns only files matching the requested extensions', async () => {
      const model = await seed(['a.png', 'b.pdf', 'c.svg']);
      const result = await model.listMedia({ searchPath: '', ext: 'pdf,svg' });
      expect(result.files.map((f) => f.filename).sort()).toEqual([
        'b.pdf',
        'c.svg',
      ]);
    });

    it('matches case-insensitively on both sides', async () => {
      const model = await seed(['SCAN.PDF']);
      const result = await model.listMedia({ searchPath: '', ext: 'PdF' });
      expect(result.files).toHaveLength(1);
    });

    it('treats an empty or blank value as no filter', async () => {
      const model = await seed(['a.png', 'b.pdf']);
      for (const ext of ['', ' , ,']) {
        const result = await model.listMedia({ searchPath: '', ext });
        expect(result.files).toHaveLength(2);
      }
    });

    it('never matches a dotfile', async () => {
      const model = await seed(['.DS_Store']);
      const result = await model.listMedia({ searchPath: '', ext: 'ds_store' });
      expect(result.files).toHaveLength(0);
    });

    // The point of filtering server-side: a page must be full of matches, not
    // a page of everything with the non-matches removed afterwards.
    it('filters before paginating', async () => {
      const names: string[] = [];
      for (let i = 0; i < 10; i++) names.push(`img-${i}.png`);
      names.push('only.pdf');
      const model = await seed(names);

      const result = await model.listMedia({
        searchPath: '',
        ext: 'pdf',
        limit: '4',
      });

      expect(result.files.map((f) => f.filename)).toEqual(['only.pdf']);
      expect(result.cursor).toBeNull();
    });

    it('applies alongside search', async () => {
      const model = await seed(['report-2024.pdf', 'report-2024.png']);
      const result = await model.listMedia({
        searchPath: '',
        search: 'report',
        ext: 'pdf',
      });
      expect(result.files.map((f) => f.filename)).toEqual(['report-2024.pdf']);
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

    it('returns matching directories as results, not only files', async () => {
      await seed();
      const model = new MediaModel(config);
      const result = await model.listMedia({ searchPath: '', search: 'deep' });
      expect(result.directories).toEqual(['/nested/deep']);
    });

    it('a parent-folder match does not include its descendants', async () => {
      await seed();
      const model = new MediaModel(config);
      const result = await model.listMedia({
        searchPath: '',
        search: 'nested',
      });
      expect(result.directories).toEqual(['/nested']);
    });

    it('returns matching directories only on the first page', async () => {
      const base = path.join(tmpDir, 'public', 'uploads');
      await fs.mkdirp(path.join(base, 'match-dir'));
      for (let i = 0; i < 15; i++) {
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
      expect(page1.directories).toEqual(['/match-dir']);
      expect(page1.files).toHaveLength(10);

      const page2 = await model.listMedia({
        searchPath: '',
        search: 'match',
        limit: '10',
        cursor: '10',
      });
      expect(page2.directories).toEqual([]);
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

  describe('renameMedia', () => {
    let mediaDir: string;

    beforeEach(() => {
      mediaDir = path.join(tmpDir, 'public', 'uploads');
    });

    it('renames a file within the media root', async () => {
      await fs.writeFile(path.join(mediaDir, 'old.txt'), 'content');
      const model = new MediaModel(config);

      const result = await model.renameMedia({
        from: 'old.txt',
        to: 'new.txt',
      });

      expect(result).toEqual({ ok: true });
      expect(await fs.pathExists(path.join(mediaDir, 'old.txt'))).toBe(false);
      expect(await fs.readFile(path.join(mediaDir, 'new.txt'), 'utf8')).toBe(
        'content'
      );
    });

    it('renames a file inside a subdirectory', async () => {
      await fs.mkdirp(path.join(mediaDir, 'products'));
      await fs.writeFile(path.join(mediaDir, 'products', 'old.txt'), 'x');
      const model = new MediaModel(config);

      const result = await model.renameMedia({
        from: 'products/old.txt',
        to: 'products/new.txt',
      });

      expect(result).toEqual({ ok: true });
      expect(
        await fs.pathExists(path.join(mediaDir, 'products', 'new.txt'))
      ).toBe(true);
    });

    it('returns NOT_FOUND when the source is missing', async () => {
      const model = new MediaModel(config);
      const result = await model.renameMedia({
        from: 'ghost.txt',
        to: 'new.txt',
      });
      expect(result).toMatchObject({ ok: false, code: 'NOT_FOUND' });
    });

    it('returns NAME_COLLISION when the destination exists', async () => {
      await fs.writeFile(path.join(mediaDir, 'old.txt'), 'a');
      await fs.writeFile(path.join(mediaDir, 'taken.txt'), 'b');
      const model = new MediaModel(config);

      const result = await model.renameMedia({
        from: 'old.txt',
        to: 'taken.txt',
      });

      expect(result).toMatchObject({ ok: false, code: 'NAME_COLLISION' });
      // the source must survive a rejected rename
      expect(await fs.readFile(path.join(mediaDir, 'old.txt'), 'utf8')).toBe(
        'a'
      );
      expect(await fs.readFile(path.join(mediaDir, 'taken.txt'), 'utf8')).toBe(
        'b'
      );
    });

    it('returns UNSUPPORTED when the source is a directory', async () => {
      await fs.mkdirp(path.join(mediaDir, 'a-folder'));
      const model = new MediaModel(config);

      const result = await model.renameMedia({
        from: 'a-folder',
        to: 'renamed-folder',
      });

      expect(result).toMatchObject({ ok: false, code: 'UNSUPPORTED' });
      expect(await fs.pathExists(path.join(mediaDir, 'a-folder'))).toBe(true);
    });

    it('performs a case-only rename and leaves no staging file behind', async () => {
      await fs.writeFile(path.join(mediaDir, 'photo.jpg'), 'bytes');
      const model = new MediaModel(config);

      const result = await model.renameMedia({
        from: 'photo.jpg',
        to: 'Photo.jpg',
      });

      expect(result).toEqual({ ok: true });
      const entries = await fs.readdir(mediaDir);
      expect(entries).toEqual(['Photo.jpg']);
      expect(await fs.readFile(path.join(mediaDir, 'Photo.jpg'), 'utf8')).toBe(
        'bytes'
      );
    });

    it('restores the source when the second staged move fails', async () => {
      await fs.writeFile(path.join(mediaDir, 'photo.jpg'), 'bytes');
      const model = new MediaModel(config);
      const realMove = fs.move;
      const move = jest.spyOn(fs, 'move');
      // staging move succeeds, the move onto the new casing fails, and the
      // restore falls through to the real implementation
      move.mockImplementationOnce(realMove).mockImplementationOnce(async () => {
        throw new Error('boom');
      });

      const result = await model.renameMedia({
        from: 'photo.jpg',
        to: 'Photo.jpg',
      });

      expect(result).toMatchObject({ ok: false, code: 'BACKEND_FAILURE' });
      const entries = await fs.readdir(mediaDir);
      expect(entries).toEqual(['photo.jpg']);
      move.mockRestore();
    });

    it('names the staging file when the source cannot be restored', async () => {
      await fs.writeFile(path.join(mediaDir, 'photo.jpg'), 'bytes');
      const model = new MediaModel(config);
      const realMove = fs.move;
      const move = jest.spyOn(fs, 'move');
      // stage succeeds, the move onto the new casing fails, and so does the
      // attempt to put the file back
      move
        .mockImplementationOnce(realMove)
        .mockImplementationOnce(async () => {
          throw new Error('boom');
        })
        .mockImplementationOnce(async () => {
          throw new Error('restore failed');
        });

      const result = await model.renameMedia({
        from: 'photo.jpg',
        to: 'Photo.jpg',
      });

      const entries = await fs.readdir(mediaDir);
      expect(entries).toHaveLength(1);
      expect(entries[0]).toMatch(/^\.tina-rename-/);
      // the surviving file is named in the message so it can be recovered
      expect(result).toMatchObject({ ok: false, code: 'BACKEND_FAILURE' });
      expect((result as { message: string }).message).toContain(entries[0]);
      move.mockRestore();
    });

    it('maps a racing destination write to NAME_COLLISION', async () => {
      await fs.writeFile(path.join(mediaDir, 'old.txt'), 'a');
      const model = new MediaModel(config);
      const move = jest.spyOn(fs, 'move').mockImplementationOnce(async () => {
        // what fs-extra raises when overwrite is false and dest appeared
        throw new Error('dest already exists.');
      });

      const result = await model.renameMedia({
        from: 'old.txt',
        to: 'new.txt',
      });

      expect(result).toMatchObject({ ok: false, code: 'NAME_COLLISION' });
      move.mockRestore();
    });

    it('throws PathTraversalError for traversal in "from"', async () => {
      const model = new MediaModel(config);
      await expect(
        model.renameMedia({ from: '../../etc/passwd', to: 'safe.txt' })
      ).rejects.toThrow(PathTraversalError);
    });

    it('throws PathTraversalError for traversal in "to"', async () => {
      await fs.writeFile(path.join(mediaDir, 'old.txt'), 'a');
      const model = new MediaModel(config);
      await expect(
        model.renameMedia({ from: 'old.txt', to: '../../escaped.txt' })
      ).rejects.toThrow(PathTraversalError);
    });

    it('throws PathTraversalError for still-encoded traversal', async () => {
      const model = new MediaModel(config);
      await expect(
        model.renameMedia({ from: '..%2f..%2fpasswd', to: 'safe.txt' })
      ).rejects.toThrow(PathTraversalError);
    });

    it.each(['', '.', './'])(
      'rejects the media root itself as a destination (%j)',
      async (to) => {
        await fs.writeFile(path.join(mediaDir, 'old.txt'), 'a');
        const model = new MediaModel(config);
        await expect(
          model.renameMedia({ from: 'old.txt', to })
        ).rejects.toThrow(PathTraversalError);
      }
    );
  });

  describe('renameMedia symlink traversal', () => {
    let outsideDir: string;

    beforeEach(async () => {
      outsideDir = path.join(
        process.env.TMPDIR || '/tmp',
        `tina-outside-rename-${Date.now()}`
      );
      await fs.mkdirp(outsideDir);
      await fs.writeFile(path.join(outsideDir, 'secret.txt'), 'sensitive');
      await fs.symlink(
        outsideDir,
        path.join(tmpDir, 'public', 'uploads', 'escape')
      );
    });

    afterEach(async () => {
      await fs.remove(outsideDir);
    });

    it('rejects a source that escapes via symlink', async () => {
      const model = new MediaModel(config);
      await expect(
        model.renameMedia({ from: 'escape/secret.txt', to: 'stolen.txt' })
      ).rejects.toThrow(PathTraversalError);
    });

    it('rejects a destination that escapes via symlink', async () => {
      await fs.writeFile(path.join(tmpDir, 'public', 'uploads', 'a.txt'), 'a');
      const model = new MediaModel(config);
      await expect(
        model.renameMedia({ from: 'a.txt', to: 'escape/planted.txt' })
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

  it('returns handleList, handleDelete, handlePost, handleRename functions', () => {
    const router = createMediaRouter(config);
    expect(typeof router.handleList).toBe('function');
    expect(typeof router.handleDelete).toBe('function');
    expect(typeof router.handlePost).toBe('function');
    expect(typeof router.handleRename).toBe('function');
  });

  describe('handleRename', () => {
    const callRename = async (router: any, body: unknown) => {
      let statusCode = 0;
      let responseBody = '';
      const res = {
        set statusCode(code: number) {
          statusCode = code;
        },
        end(data: string) {
          responseBody = data;
        },
      };
      await router.handleRename({ url: '/media/rename', body } as any, res);
      return { statusCode, body: JSON.parse(responseBody || '{}') };
    };

    it('returns 200 and moves the file', async () => {
      const mediaDir = path.join(tmpDir, 'public', 'uploads');
      await fs.writeFile(path.join(mediaDir, 'old.txt'), 'data');
      const router = createMediaRouter(config);

      const res = await callRename(router, {
        from: 'old.txt',
        to: 'new.txt',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        from: 'old.txt',
        to: 'new.txt',
      });
      expect(await fs.pathExists(path.join(mediaDir, 'new.txt'))).toBe(true);
    });

    // Guards the contract, not the handler: unknown keys must not start
    // 400ing if body validation is ever tightened.
    it('accepts and ignores unknown fields in the body', async () => {
      const mediaDir = path.join(tmpDir, 'public', 'uploads');
      await fs.writeFile(path.join(mediaDir, 'old.txt'), 'data');
      const router = createMediaRouter(config);

      const res = await callRename(router, {
        from: 'old.txt',
        to: 'new.txt',
        branch: 'main',
      });

      expect(res.statusCode).toBe(200);
    });

    it('returns 400 INVALID_FILENAME when from/to are missing', async () => {
      const router = createMediaRouter(config);
      const res = await callRename(router, { from: 'old.txt' });
      expect(res.statusCode).toBe(400);
      expect(res.body.code).toBe('INVALID_FILENAME');
    });

    it('returns 400 INVALID_FILENAME when the body is absent', async () => {
      const router = createMediaRouter(config);
      const res = await callRename(router, undefined);
      expect(res.statusCode).toBe(400);
      expect(res.body.code).toBe('INVALID_FILENAME');
    });

    it('returns 404 NOT_FOUND for a missing source', async () => {
      const router = createMediaRouter(config);
      const res = await callRename(router, {
        from: 'ghost.txt',
        to: 'new.txt',
      });
      expect(res.statusCode).toBe(404);
      expect(res.body.code).toBe('NOT_FOUND');
    });

    it('returns 409 NAME_COLLISION when the destination is taken', async () => {
      const mediaDir = path.join(tmpDir, 'public', 'uploads');
      await fs.writeFile(path.join(mediaDir, 'old.txt'), 'a');
      await fs.writeFile(path.join(mediaDir, 'taken.txt'), 'b');
      const router = createMediaRouter(config);

      const res = await callRename(router, {
        from: 'old.txt',
        to: 'taken.txt',
      });

      expect(res.statusCode).toBe(409);
      expect(res.body.code).toBe('NAME_COLLISION');
      expect(res.body.message).toContain('taken.txt');
    });

    it('returns 400 UNSUPPORTED when the source is a folder', async () => {
      await fs.mkdirp(path.join(tmpDir, 'public', 'uploads', 'a-folder'));
      const router = createMediaRouter(config);

      const res = await callRename(router, {
        from: 'a-folder',
        to: 'b-folder',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.code).toBe('UNSUPPORTED');
    });

    it('returns 403 INVALID_PATH for traversal', async () => {
      const router = createMediaRouter(config);
      const res = await callRename(router, {
        from: '../../etc/passwd',
        to: 'safe.txt',
      });
      expect(res.statusCode).toBe(403);
      expect(res.body.code).toBe('INVALID_PATH');
      expect(res.body.message).toContain('Path traversal detected');
    });

    it('returns 403 INVALID_PATH when the destination escapes the media root', async () => {
      await fs.writeFile(path.join(tmpDir, 'public', 'uploads', 'a.txt'), 'a');
      const router = createMediaRouter(config);
      const res = await callRename(router, {
        from: 'a.txt',
        to: '../../evil.txt',
      });
      expect(res.statusCode).toBe(403);
      expect(res.body.code).toBe('INVALID_PATH');
    });
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
