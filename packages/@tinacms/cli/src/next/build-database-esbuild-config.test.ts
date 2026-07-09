import type { Loader } from 'esbuild';
import { buildDatabaseEsbuildConfig } from './build-database-esbuild-config';

const baseOpts = {
  entryPoint: '/project/tina/database.ts',
  outfile:
    '/project/tina/__generated__/.cache/12345/database/database.build.mjs',
  absWorkingDir: '/project',
  external: ['better-sqlite3'],
  loader: { '.ts': 'ts' as Loader },
};

describe('buildDatabaseEsbuildConfig — externalize contract', () => {
  // The asserts in this describe block lock down regressions called out in
  // #6785: removing the better-sqlite3 external (re-introducing the
  // __filename crash) or replacing it with `packages: 'external'` (which
  // breaks named imports of CJS UMD packages like sqlite-level v1).

  it('externalizes better-sqlite3 by passing it through to esbuild', () => {
    const config = buildDatabaseEsbuildConfig(baseOpts);
    expect(config.external).toContain('better-sqlite3');
  });

  it('passes the caller-provided external list through unchanged', () => {
    const config = buildDatabaseEsbuildConfig({
      ...baseOpts,
      external: ['better-sqlite3', 'my-custom-native-adapter', 'another-pkg'],
    });
    expect(config.external).toEqual([
      'better-sqlite3',
      'my-custom-native-adapter',
      'another-pkg',
    ]);
  });

  it('does NOT use `packages: "external"` (broad-externalize regression guard)', () => {
    // This is the critical assertion from #6785. Setting `packages: 'external'`
    // would also externalize CJS UMD packages like sqlite-level v1 and
    // mongodb-level, breaking user-side `import { SqliteLevel } from
    // 'sqlite-level'` because Node's cjs-module-lexer can't reliably detect
    // their named exports. We must externalize a curated baseline, not
    // everything in node_modules.
    const config = buildDatabaseEsbuildConfig(baseOpts);
    expect(config.packages).toBeUndefined();
  });
});

describe('buildDatabaseEsbuildConfig — output path contract', () => {
  // Locks down the regression where someone changes `loadDatabaseFile` to
  // write to `os.tmpdir()` again. The helper itself doesn't construct paths
  // (the caller does), but it must faithfully forward whatever it's given.
  // The caller-side guarantee that the path is in the project tree is
  // enforced by `prepareCacheLocation()` in cache-manager.ts.

  it('forwards the caller-provided outfile unchanged', () => {
    const config = buildDatabaseEsbuildConfig(baseOpts);
    expect(config.outfile).toBe(baseOpts.outfile);
  });

  it('pins esbuild package resolution to the caller-provided project root', () => {
    const config = buildDatabaseEsbuildConfig(baseOpts);
    expect(config.absWorkingDir).toBe(baseOpts.absWorkingDir);
  });

  it('outfile is whatever was passed in — no remapping', () => {
    const customOutfile = '/some/other/path/build.mjs';
    const config = buildDatabaseEsbuildConfig({
      ...baseOpts,
      outfile: customOutfile,
    });
    expect(config.outfile).toBe(customOutfile);
  });
});

describe('buildDatabaseEsbuildConfig — fixed esbuild options', () => {
  // These options should never change without a careful review — they're
  // the contract Tina's runtime depends on for ESM dynamic-import to work.

  it('bundles user code (entryPoints + bundle: true)', () => {
    const config = buildDatabaseEsbuildConfig(baseOpts);
    expect(config.entryPoints).toEqual([baseOpts.entryPoint]);
    expect(config.bundle).toBe(true);
  });

  it('targets Node ESM output', () => {
    const config = buildDatabaseEsbuildConfig(baseOpts);
    expect(config.platform).toBe('node');
    expect(config.format).toBe('esm');
  });

  it('forwards the caller-provided loader map', () => {
    const customLoader = { '.ts': 'ts' as Loader, '.svg': 'file' as Loader };
    const config = buildDatabaseEsbuildConfig({
      ...baseOpts,
      loader: customLoader,
    });
    expect(config.loader).toBe(customLoader);
  });

  it('injects the createRequire banner so bundled CJS deps can call require()', () => {
    // Some bundled packages (e.g. `scmp` via mongodb-level) use require() for
    // Node built-ins. The banner re-creates require() in the ESM context
    // using Node's official createRequire API. Removing it would silently
    // break any bundled CJS dep that calls require() at runtime.
    const config = buildDatabaseEsbuildConfig(baseOpts);
    expect(config.banner?.js).toContain('createRequire');
    expect(config.banner?.js).toContain('import.meta.url');
  });
});
