import type { BuildOptions, Loader } from 'esbuild';

/**
 * Construct the esbuild options used by `loadDatabaseFile()` to bundle a
 * user's `tina/database.ts`.
 *
 * Extracted from `config-manager.ts` so the externalize / output-path
 * contract — both critical for the ESM native-module fix (#6675, #6750) —
 * can be locked down by unit tests without spinning up the full
 * ConfigManager (which uses `import.meta.url` at module load and isn't
 * directly importable from Jest's CJS runtime).
 *
 * The contract enforced here is intentionally strict:
 *
 * - `external` is set to the caller-provided list (typically the curated
 *   baseline + `build.externalDependencies`). NEVER set `packages: 'external'`
 *   — broad-externalize would also externalize CJS UMD packages like
 *   `sqlite-level` (v1) and `mongodb-level`, breaking user-side named imports
 *   because Node's `cjs-module-lexer` can't reliably detect their exports.
 *   See #6785 for the regression test that locks this down.
 *
 * - `outfile` is whatever the caller passes in. The caller is responsible for
 *   constructing a path inside the project tree (typically via
 *   `prepareCacheLocation()` from `cache-manager.ts`) so Node's runtime
 *   resolver can walk up to the project's `node_modules` and find the
 *   externalized packages.
 */
export const buildDatabaseEsbuildConfig = (opts: {
  /** Path to the user's `tina/database.ts`. */
  entryPoint: string;
  /** Where esbuild writes the bundled `.mjs`. Must be inside the project tree. */
  outfile: string;
  /** Externalized package names (must include `better-sqlite3` baseline). */
  external: string[];
  /** Loader map shared with the rest of the CLI (asset extensions, .ts/.tsx, etc.). */
  loader: { [ext: string]: Loader };
}): BuildOptions => ({
  entryPoints: [opts.entryPoint],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: opts.outfile,
  loader: opts.loader,
  external: opts.external,
  // Provide a require() polyfill for ESM bundles containing CommonJS packages.
  // Some bundled packages (e.g., 'scmp' used by 'mongodb-level') use
  // require('crypto'). When esbuild inlines these CommonJS packages, it keeps
  // the require() calls, but ESM doesn't have a global require. This banner
  // creates one using Node.js's official createRequire API, allowing the
  // bundled CommonJS code to work in ESM.
  banner: {
    js: `import { createRequire } from 'module';const require = createRequire(import.meta.url);`,
  },
});
