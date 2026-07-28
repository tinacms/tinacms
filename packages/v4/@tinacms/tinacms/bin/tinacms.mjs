#!/usr/bin/env node
// The bin is JavaScript and the CLI it runs is TypeScript, loaded through Vite
// rather than node's own type stripping: node can strip the types but not follow
// this package's extensionless relative imports, since `exports` still points at
// raw src (ADR-001 leaves the dist build undecided).
//
// No cost either way — the CLI needs a Vite server regardless, because that is how
// a user's tina/config.ts gets read. This boots it once and lends it downstream.

import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const server = await createServer({
  configFile: false,
  logLevel: 'warn',
  server: { middlewareMode: true, hmr: false, watch: null },
});

try {
  const { runCli } = await server.ssrLoadModule(
    fileURLToPath(new URL('../src/cli/index.ts', import.meta.url))
  );
  process.exitCode = await runCli(process.argv.slice(2), { loader: server });
} finally {
  await server.close();
}
