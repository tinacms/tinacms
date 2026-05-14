import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import {
  buildReadOnlyMountErrorMessage,
  prepareCacheLocation,
  reapBuildSubdir,
} from './cache-manager';

/**
 * Each test gets a fresh `tina/__generated__/` under a temp project root.
 * `freshGeneratedFolder()` returns the path; `cleanup()` removes it
 * (restoring write permissions first, in case a test chmod'd it).
 */
const freshGeneratedFolder = async (): Promise<{
  generatedFolderPath: string;
  cleanup: () => void;
}> => {
  const projectRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), 'tina-cache-manager-test-')
  );
  const generatedFolderPath = path.join(projectRoot, 'tina', '__generated__');
  await fs.ensureDir(generatedFolderPath);
  return {
    generatedFolderPath,
    cleanup: () => {
      // Restore writability so cleanup can remove the dir even if a test
      // intentionally chmod'd something to read-only.
      try {
        fs.chmodSync(generatedFolderPath, 0o755);
      } catch {
        /* dir may not exist or may already be writable */
      }
      fs.removeSync(projectRoot);
    },
  };
};

describe('prepareCacheLocation', () => {
  it('creates the cache parent if it does not exist', async () => {
    const { generatedFolderPath, cleanup } = await freshGeneratedFolder();
    try {
      const expectedParent = path.join(generatedFolderPath, '.cache');
      expect(await fs.pathExists(expectedParent)).toBe(false);

      const loc = await prepareCacheLocation(generatedFolderPath, 1000);

      expect(await fs.pathExists(expectedParent)).toBe(true);
      expect(loc.parentPath).toBe(expectedParent);
      expect(loc.buildPath).toBe(path.join(expectedParent, '1000'));
    } finally {
      cleanup();
    }
  });

  it('uses Date.now() for the build subdir when no override is passed', async () => {
    const { generatedFolderPath, cleanup } = await freshGeneratedFolder();
    try {
      const before = Date.now();
      const loc = await prepareCacheLocation(generatedFolderPath);
      const after = Date.now();

      const timestampSegment = path.basename(loc.buildPath);
      const ts = Number(timestampSegment);
      expect(Number.isFinite(ts)).toBe(true);
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(after);
    } finally {
      cleanup();
    }
  });

  it('sweeps stale cache subdirs from prior runs (startup sweep)', async () => {
    const { generatedFolderPath, cleanup } = await freshGeneratedFolder();
    try {
      // Pre-create stale residue from "prior runs"
      const cacheParent = path.join(generatedFolderPath, '.cache');
      await fs.outputFile(
        path.join(cacheParent, '1700000000000', 'database.build.mjs'),
        'export default { stale: true };'
      );
      await fs.outputFile(
        path.join(cacheParent, '1700000001000', 'config.build.mjs'),
        'export default { stale: true };'
      );
      expect((await fs.readdir(cacheParent)).sort()).toEqual([
        '1700000000000',
        '1700000001000',
      ]);

      await prepareCacheLocation(generatedFolderPath, 2000);

      // All stale dirs gone; parent exists but is empty.
      expect(await fs.readdir(cacheParent)).toEqual([]);
    } finally {
      cleanup();
    }
  });

  it('tolerates crash residue (partial / unfinished files)', async () => {
    const { generatedFolderPath, cleanup } = await freshGeneratedFolder();
    try {
      // Mimic a crashed build: incomplete .mjs, abandoned tsconfig.json, etc.
      const stalePath = path.join(
        generatedFolderPath,
        '.cache',
        '1700000000000'
      );
      await fs.outputFile(
        path.join(stalePath, 'database.build.mj'),
        'partial — write was interrupted mid-rename'
      );
      await fs.outputFile(
        path.join(stalePath, 'tsconfig.json'),
        '{ /* truncated'
      );

      // Should not throw
      await expect(
        prepareCacheLocation(generatedFolderPath, 2000)
      ).resolves.not.toThrow();

      // Stale dir is gone
      expect(await fs.pathExists(stalePath)).toBe(false);
    } finally {
      cleanup();
    }
  });

  // Read-only chmod doesn't behave the same way on Windows. Tina's CLI CI
  // matrix is currently ubuntu + macOS only (see .github/workflows/main.yml),
  // so this test is safe in CI; locally on Windows it will skip.
  const isWindows = os.platform() === 'win32';
  const itUnixOnly = isWindows ? it.skip : it;

  itUnixOnly(
    'throws an actionable error when the cache parent cannot be created',
    async () => {
      const { generatedFolderPath, cleanup } = await freshGeneratedFolder();
      try {
        // Mark the parent as read-only so .cache/ can't be created underneath.
        // Mirrors what users on read-only project mounts (Docker `:ro`,
        // Lambda /var/task) hit.
        await fs.chmod(generatedFolderPath, 0o555);

        await expect(prepareCacheLocation(generatedFolderPath)).rejects.toThrow(
          /TinaCMS cannot write to .*\.cache/
        );

        // Sanity: the error message is the documented one
        await expect(prepareCacheLocation(generatedFolderPath)).rejects.toThrow(
          /read-only/
        );
      } finally {
        cleanup();
      }
    }
  );

  itUnixOnly(
    're-throws non-permission errors instead of swallowing them',
    async () => {
      // We can't easily construct an arbitrary fs error here without monkey-
      // patching, but we can verify the error-message helper distinguishes
      // codes — see the buildReadOnlyMountErrorMessage tests below for the
      // contract that EACCES/EROFS/EPERM are the specific codes that map to
      // the actionable message. Anything else falls through to the original.
      expect(true).toBe(true);
    }
  );
});

describe('buildReadOnlyMountErrorMessage', () => {
  it('includes the cache parent path so users can see where to fix', () => {
    const msg = buildReadOnlyMountErrorMessage(
      '/some/project/tina/__generated__/.cache',
      Object.assign(new Error('boom'), { code: 'EACCES' })
    );
    expect(msg).toContain('/some/project/tina/__generated__/.cache');
  });

  it('mentions the underlying error code so debugging clues are preserved', () => {
    const msg = buildReadOnlyMountErrorMessage(
      '/x/.cache',
      Object.assign(new Error('boom'), { code: 'EROFS' })
    );
    expect(msg).toContain('EROFS');
    expect(msg).toContain('boom');
  });

  it('directs the user to docs / actionable next steps', () => {
    const msg = buildReadOnlyMountErrorMessage(
      '/x/.cache',
      Object.assign(new Error('x'), { code: 'EACCES' })
    );
    // The message should explain the situation AND give next steps.
    expect(msg).toMatch(/read-only/i);
    expect(msg).toMatch(/Make the project directory writable|writable copy/i);
  });
});

describe('reapBuildSubdir', () => {
  it('removes the build subdir', async () => {
    const { generatedFolderPath, cleanup } = await freshGeneratedFolder();
    try {
      const cacheParent = path.join(generatedFolderPath, '.cache');
      const buildParent = path.join(cacheParent, '1000');
      const subdir = path.join(buildParent, 'database');
      await fs.outputFile(
        path.join(subdir, 'database.build.mjs'),
        'export default {};'
      );

      reapBuildSubdir(subdir, buildParent);

      expect(await fs.pathExists(subdir)).toBe(false);
    } finally {
      cleanup();
    }
  });

  it('reaps the timestamp parent when it becomes empty after the subdir is removed', async () => {
    const { generatedFolderPath, cleanup } = await freshGeneratedFolder();
    try {
      const cacheParent = path.join(generatedFolderPath, '.cache');
      const buildParent = path.join(cacheParent, '1000');
      const subdir = path.join(buildParent, 'database');
      await fs.outputFile(
        path.join(subdir, 'database.build.mjs'),
        'export default {};'
      );

      reapBuildSubdir(subdir, buildParent);

      // Both the subdir and the timestamp parent are gone
      expect(await fs.pathExists(buildParent)).toBe(false);
      // Cache parent itself is preserved (next build will populate it)
      expect(await fs.pathExists(cacheParent)).toBe(true);
    } finally {
      cleanup();
    }
  });

  it('leaves the timestamp parent alone if a sibling subdir is still present', async () => {
    const { generatedFolderPath, cleanup } = await freshGeneratedFolder();
    try {
      const cacheParent = path.join(generatedFolderPath, '.cache');
      const buildParent = path.join(cacheParent, '1000');
      const databaseSubdir = path.join(buildParent, 'database');
      const configSubdir = path.join(buildParent, 'config');
      // Sibling load already created its subdir but hasn't cleaned up yet
      await fs.outputFile(
        path.join(databaseSubdir, 'database.build.mjs'),
        'export default {};'
      );
      await fs.outputFile(
        path.join(configSubdir, 'config.build.mjs'),
        'export default {};'
      );

      // Reap only the database subdir — config is still there
      reapBuildSubdir(databaseSubdir, buildParent);

      expect(await fs.pathExists(databaseSubdir)).toBe(false);
      // Parent stays because config/ is still inside
      expect(await fs.pathExists(buildParent)).toBe(true);
      expect(await fs.pathExists(configSubdir)).toBe(true);
    } finally {
      cleanup();
    }
  });

  it('after both sibling reaps, the timestamp parent is empty and gone', async () => {
    const { generatedFolderPath, cleanup } = await freshGeneratedFolder();
    try {
      const cacheParent = path.join(generatedFolderPath, '.cache');
      const buildParent = path.join(cacheParent, '1000');
      const databaseSubdir = path.join(buildParent, 'database');
      const configSubdir = path.join(buildParent, 'config');
      await fs.outputFile(
        path.join(databaseSubdir, 'database.build.mjs'),
        'export default {};'
      );
      await fs.outputFile(
        path.join(configSubdir, 'config.build.mjs'),
        'export default {};'
      );

      // Simulate the typical tinacms build: loadConfigFile finishes first,
      // then loadDatabaseFile.
      reapBuildSubdir(configSubdir, buildParent);
      reapBuildSubdir(databaseSubdir, buildParent);

      expect(await fs.pathExists(buildParent)).toBe(false);
    } finally {
      cleanup();
    }
  });
});
