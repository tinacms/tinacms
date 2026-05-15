// Consumer-side regression test for the generated `./types.js` import in
// `client.ts` / `databaseClient.ts`. The unit tests in index.test.ts only
// string-match the generator output; this suite actually runs the two
// real consumers (the TypeScript compiler and Node native ESM) against a
// fixture that mirrors what the generator emits.
//
// This is the test #6739 needed: it spawns `tsc --noEmit` over a fixture
// with a Next.js-style tsconfig (moduleResolution: bundler, no
// allowImportingTsExtensions) and asserts the import resolves cleanly.
// It also esbuild-transforms the fixture to JS and asserts Node ESM can
// load it — the failure mode that originally produced #6062.

import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { transform } from 'esbuild';

const FIXTURE_DIR = path.join(__dirname, '__fixtures__', 'generated-consumer');

function runTsc(tsconfigFile: string) {
  const tscPath = require.resolve('typescript/bin/tsc');
  return spawnSync(
    process.execPath,
    [tscPath, '--noEmit', '-p', path.join(FIXTURE_DIR, tsconfigFile)],
    { encoding: 'utf-8' }
  );
}

describe('generated client consumer resolution', () => {
  // The issue table lists three import-string forms that real-world consumers
  // require: `./types` (TS default), `./types.ts` (allowImportingTsExtensions),
  // and `./types.js` (Node ESM). The CLI emits the `.js` form unconditionally;
  // these tests cover the two TypeScript moduleResolution modes our users hit
  // (`bundler` and legacy `node`) and the Node ESM runtime.
  it('tsc resolves "./types.js" under moduleResolution: bundler (Next.js 13.2+ default)', () => {
    const result = runTsc('tsconfig.json');
    if (result.status !== 0) {
      // eslint-disable-next-line no-console
      console.error('tsc stdout:', result.stdout);
      // eslint-disable-next-line no-console
      console.error('tsc stderr:', result.stderr);
    }
    expect(result.status).toBe(0);
  });

  it('tsc resolves "./types.js" under moduleResolution: node (legacy) with strict on', () => {
    // Pins the coverage gap the user surfaced: even classic node resolution
    // (no `.js` → `.ts` rewrite) must be satisfied. It is, because we ship a
    // co-resident `types.ts` next to `types.js` — TypeScript 4.7+ finds the
    // sibling .ts source for the .js import. If a future change ever drops
    // `types.ts` from the TS branch, strict-mode users on legacy resolution
    // would regress; this test catches that.
    const result = runTsc('tsconfig.node.json');
    if (result.status !== 0) {
      // eslint-disable-next-line no-console
      console.error('tsc stdout:', result.stdout);
      // eslint-disable-next-line no-console
      console.error('tsc stderr:', result.stderr);
    }
    expect(result.status).toBe(0);
  });

  it('node native ESM resolves the generated client when types.js is co-resident on disk', async () => {
    // Mirrors what the CLI now produces for TS projects: types.ts plus a
    // co-resident types.js. We only need the .js files for the runtime
    // check, so transform the TS sources straight into the temp dir.
    const tmp = mkdtempSync(path.join(tmpdir(), 'tina-types-js-'));
    try {
      const clientTs = readFileSync(
        path.join(FIXTURE_DIR, 'client.ts'),
        'utf-8'
      );
      const typesTs = readFileSync(path.join(FIXTURE_DIR, 'types.ts'), 'utf-8');

      const clientJs = await transform(clientTs, { loader: 'ts' });
      const typesJs = await transform(typesTs, { loader: 'ts' });

      writeFileSync(path.join(tmp, 'client.js'), clientJs.code);
      writeFileSync(path.join(tmp, 'types.js'), typesJs.code);
      // Force ESM semantics for the .js files in this directory.
      writeFileSync(
        path.join(tmp, 'package.json'),
        JSON.stringify({ type: 'module' })
      );
      writeFileSync(
        path.join(tmp, 'entry.mjs'),
        "import('./client.js').then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });\n"
      );

      const result = spawnSync(
        process.execPath,
        [path.join(tmp, 'entry.mjs')],
        { encoding: 'utf-8' }
      );

      if (result.status !== 0) {
        // eslint-disable-next-line no-console
        console.error('node stdout:', result.stdout);
        // eslint-disable-next-line no-console
        console.error('node stderr:', result.stderr);
      }
      expect(result.status).toBe(0);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
