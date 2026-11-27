import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfigFromFile } from 'vite';
import { expect, it } from 'vitest';

// Vite bundles a config's relative imports with esbuild, and that bundle pulls in
// every lazy `client` segment the plugin module reaches. Node cannot load their
// `.tsx`, so the Vite config of every app stops loading. Vitest transforms `.tsx`,
// so only the real config loader shows it.
it('a Vite config that imports the plugin loads in Node', async () => {
  const configFile = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    'fixtures/plugin.vite.config.ts'
  );
  const loaded = await loadConfigFromFile(
    { command: 'serve', mode: 'development' },
    configFile
  );
  expect(loaded?.config.plugins).toHaveLength(1);
});
