// Adapter-matrix tests need native ESM because they import config-manager.ts,
// which uses import.meta.url. Keep that setup isolated so the default CLI Jest
// suite can stay on its existing CJS-compatible config.
//
// sqlite-level depends on native better-sqlite3, which is externalized during
// fixture bundling. Add sqlite-level's pnpm dependency root so runtime Node
// resolution can find that transitive dependency without a new direct devDep.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import base from './jest.config.js';

// Follow the sqlite-level symlink to the directory that contains its deps.
const HERE = path.dirname(fileURLToPath(import.meta.url));
const sqliteLevelDepsRoot = path.dirname(
  fs.realpathSync(path.join(HERE, 'node_modules/sqlite-level'))
);

export default {
  ...base,
  extensionsToTreatAsEsm: ['.ts'],
  moduleDirectories: ['node_modules', sqliteLevelDepsRoot],
  // Keep adapter tests out of the default Jest run; enable discovery here.
  testMatch: ['**/*.adapter-test.[jt]s?(x)'],
};
