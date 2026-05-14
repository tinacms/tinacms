import type { Config } from '@tinacms/schema-tools';

/**
 * Packages always externalized when bundling `tina/database.ts`.
 *
 * `better-sqlite3` is a native CJS module — it ships a `.node` binary and its
 * `bindings` dependency uses `__filename` to locate it. Both fundamentals are
 * incompatible with ESM bundling, so it must be left as a runtime import.
 *
 * Users can extend this list via `build.externalDependencies` in their
 * `tina/config.ts` when they need to externalize additional packages (e.g.
 * a custom native adapter outside this baseline).
 */
export const EXTERNAL_BASELINE = ['better-sqlite3'];

/**
 * Resolve the full list of packages to externalize when bundling
 * `tina/database.ts`. Combines the always-on baseline (which fixes native
 * modules out of the box) with the user-provided
 * `build.externalDependencies` extension list from their config.
 *
 * Order is significant: baseline first, then user list — so users can't
 * accidentally remove an item from the baseline by listing it themselves.
 */
export const resolveDatabaseExternals = (
  config: Config | undefined
): string[] => {
  const userExternals = config?.build?.externalDependencies ?? [];
  return [...EXTERNAL_BASELINE, ...userExternals];
};
