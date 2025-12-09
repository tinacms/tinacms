import { it, expect, describe, vi } from 'vitest';
import { makeCacheDir } from './node-cache.ts';

const createMockFs = (existsSync = true) => ({
  existsSync: vi.fn().mockReturnValue(existsSync),
  mkdirSync: vi.fn(),
});

const createUnixMockPath = () => ({
  sep: '/',
  normalize: vi.fn((p: string) => p),
  join: vi.fn((...parts: string[]) => parts.join('/')),
});

const createWindowsMockPath = (shouldNormalize = true) => ({
  sep: '\\',
  normalize: vi.fn((p: string) =>
    shouldNormalize ? p.replace(/\//g, '\\') : p
  ),
  join: vi.fn((...parts: string[]) => parts.join('\\')),
});

describe('makeCacheDir', () => {
  describe('Unix/Linux/macOS', () => {
    it('should return the original directory if the root directory exists', async () => {
      const mockPath = createUnixMockPath();
      const mockFs = createMockFs(true);

      const dir = '/root/.cache/1234';
      const result = await makeCacheDir(dir, mockFs, mockPath, {});

      expect(result).toBe(dir);
      expect(mockFs.existsSync).toHaveBeenCalledWith('/root');
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(dir, { recursive: true });
    });

    it('should fall back to tmpdir if root directory does not exist', async () => {
      const mockPath = createUnixMockPath();
      const mockFs = createMockFs(false);
      const mockOs = { tmpdir: vi.fn().mockReturnValue('/var') };

      const dir = '/nonexistent/.cache/1234';
      const result = await makeCacheDir(dir, mockFs, mockPath, mockOs);

      expect(result).toBe('/var/1234');
      expect(mockFs.existsSync).toHaveBeenCalledWith('/nonexistent');
      expect(mockFs.mkdirSync).toHaveBeenCalledWith('/var/1234', {
        recursive: true,
      });
    });

    it('should handle macOS-style paths (/Users/...)', async () => {
      const mockPath = createUnixMockPath();
      const mockFs = createMockFs(true);

      const dir = '/Users/developer/project/tina/__generated__/.cache/1234';
      const result = await makeCacheDir(dir, mockFs, mockPath, {});

      expect(result).toBe(dir);
      expect(mockFs.existsSync).toHaveBeenCalledWith('/Users');
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(dir, { recursive: true });
    });

    it('should handle Linux-style paths (/home/...)', async () => {
      const mockPath = createUnixMockPath();
      const mockFs = createMockFs(true);

      const dir = '/home/user/project/tina/__generated__/.cache/1234';
      const result = await makeCacheDir(dir, mockFs, mockPath, {});

      expect(result).toBe(dir);
      expect(mockFs.existsSync).toHaveBeenCalledWith('/home');
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(dir, { recursive: true });
    });
  });

  describe('Windows', () => {
    it('should handle forward-slash normalized paths', async () => {
      const mockPath = createWindowsMockPath(true);
      const mockFs = createMockFs(true);

      const dir = 'C:/code/SSW.Rules.Tina/tina/__generated__/.cache/1234';
      const result = await makeCacheDir(dir, mockFs, mockPath, {});

      expect(mockPath.normalize).toHaveBeenCalledWith(dir);
      expect(result).toBe(
        'C:\\code\\SSW.Rules.Tina\\tina\\__generated__\\.cache\\1234'
      );
      expect(mockFs.existsSync).toHaveBeenCalledWith('C:\\');
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        'C:\\code\\SSW.Rules.Tina\\tina\\__generated__\\.cache\\1234',
        { recursive: true }
      );
    });

    it('should handle native backslash paths', async () => {
      const mockPath = createWindowsMockPath(false);
      const mockFs = createMockFs(true);

      const dir = 'C:\\code\\project\\tina\\__generated__\\.cache\\1234';
      const result = await makeCacheDir(dir, mockFs, mockPath, {});

      expect(result).toBe(dir);
      expect(mockFs.existsSync).toHaveBeenCalledWith('C:\\');
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(dir, { recursive: true });
    });

    it('should fall back to tmpdir when drive does not exist', async () => {
      const mockPath = createWindowsMockPath(true);
      const mockFs = createMockFs(false);
      const mockOs = {
        tmpdir: vi
          .fn()
          .mockReturnValue('C:\\Users\\test\\AppData\\Local\\Temp'),
      };

      const dir = 'D:/nonexistent/path/.cache/1234';
      const result = await makeCacheDir(dir, mockFs, mockPath, mockOs);

      expect(result).toBe('C:\\Users\\test\\AppData\\Local\\Temp\\1234');
      expect(mockFs.existsSync).toHaveBeenCalledWith('D:\\');
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        'C:\\Users\\test\\AppData\\Local\\Temp\\1234',
        { recursive: true }
      );
    });
  });

  describe('error handling', () => {
    it('should return null and log warning if mkdirSync fails', async () => {
      const mockPath = createUnixMockPath();
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});
      const mockFs = {
        existsSync: vi.fn().mockReturnValue(true),
        mkdirSync: vi.fn(() => {
          throw new Error('mkdir failed');
        }),
      };

      const dir = '/root/.cache/1234';
      const result = await makeCacheDir(dir, mockFs, mockPath, {});

      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Warning: Failed to create cache directory: mkdir failed. Caching will be disabled.'
      );

      consoleWarnSpy.mockRestore();
    });
  });
});
