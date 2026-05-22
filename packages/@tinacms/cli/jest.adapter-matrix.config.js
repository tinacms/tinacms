// Adapter-matrix test config. Inherits the default jest config and enables
// native ESM so that `src/next/config-manager.ts` (which uses
// `import.meta.url` at module load) can be imported by the test. The rest of
// the CLI test suite stays on the default CJS-backed config so existing
// `jest.mock(...)` patterns are untouched.
//
// `better-sqlite3` is in EXTERNAL_BASELINE (native, can't be ESM-bundled), so
// the bundled fixture imports it at runtime. With pnpm's isolated layout it
// isn't symlinked into the CLI's `node_modules` because the CLI itself doesn't
// declare it — only `sqlite-level` does, as a transitive dep. We expose
// `sqlite-level`'s sibling node_modules to Jest's resolver so `better-sqlite3`
// can be found from the cache-dir build output without adding a redundant
// direct dependency on a native package.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import base from './jest.config.js';

// Resolve sqlite-level's real (pnpm-isolated) location by following the
// symlink the CLI's local node_modules sets up. The parent of that directory
// is the .pnpm folder where sqlite-level's sibling deps live, including the
// native `better-sqlite3` that we externalise from the esbuild bundle.
const HERE = path.dirname(fileURLToPath(import.meta.url));
const sqliteLevelDepsRoot = path.dirname(
  fs.realpathSync(path.join(HERE, 'node_modules/sqlite-level'))
);

export default {
  ...base,
  extensionsToTreatAsEsm: ['.ts'],
  moduleDirectories: ['node_modules', sqliteLevelDepsRoot],
};
