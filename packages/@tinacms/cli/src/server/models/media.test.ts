import path from 'path';
import fs from 'fs-extra';
import { PathTraversalError } from '../../utils/path';
import { MediaModel, PathConfig } from './media';

describe('MediaModel (Express server)', () => {
  let tmpDir: string;
  let config: PathConfig;

  beforeEach(async () => {
    tmpDir = path.join(
      process.env.TMPDIR || '/tmp',
      `tinacms-media-model-${Date.now()}`
    );
    await fs.mkdirp(path.join(tmpDir, 'public', 'uploads'));
    config = {
      rootPath: tmpDir,
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
      await fs.writeFile(path.join(mediaDir, 'image.png'), 'fake-png');
      const model = new MediaModel(config);
      const result = await model.listMedia({ searchPath: '' });
      expect(result.files).toHaveLength(1);
      expect(result.files[0].filename).toBe('image.png');
    });

    it('returns empty for non-existent directory', async () => {
      const model = new MediaModel(config);
      const result = await model.listMedia({ searchPath: 'no-such-dir' });
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
      const filePath = path.join(mediaDir, 'to-delete.txt');
      await fs.writeFile(filePath, 'delete me');
      const model = new MediaModel(config);
      const result = await model.deleteMedia({ searchPath: 'to-delete.txt' });
      expect(result).toEqual({ ok: true });
      expect(await fs.pathExists(filePath)).toBe(false);
    });

    it('returns failure for non-existent file', async () => {
      const model = new MediaModel(config);
      const result = await model.deleteMedia({ searchPath: 'no-file.txt' });
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
