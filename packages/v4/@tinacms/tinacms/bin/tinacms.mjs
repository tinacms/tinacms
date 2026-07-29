#!/usr/bin/env node
// The bin is JavaScript, and the CLI that it runs is TypeScript. Vite loads that
// TypeScript, and node does not strip the types. Node can strip the types, but it cannot
// follow the relative imports of this package, which have no extension. The `exports`
// field still points at the raw source, because ADR-001 has not decided the dist build.
//
// This costs nothing. The CLI needs a Vite server in any case, because that is how it
// reads the tina/config.ts of a user. This file starts one server, and lends it to the
// code below.

import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const server = await createServer({
  configFile: false,
  logLevel: 'warn',
  // `ws: false` is required, and `hmr: false` alone is not enough. In middleware mode
  // Vite has no HTTP server for the HMR socket, falls through, and binds its default
  // port 24678 on every interface — so running the CLI would claim a fixed global
  // port and two runs at once would race. load-config.ts guards the same way.
  server: { middlewareMode: true, hmr: false, ws: false, watch: null },
});

try {
  const { runCli } = await server.ssrLoadModule(
    fileURLToPath(new URL('../src/cli/index.ts', import.meta.url))
  );
  process.exitCode = await runCli(process.argv.slice(2), { loader: server });
} finally {
  await server.close();
}
