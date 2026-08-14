#!/usr/bin/env node
// The CLI is TypeScript with extensionless relative imports, so node needs Vite
// to load it until ADR-001 lands a dist build. This server loads only the CLI;
// the CLI opens its own server for the user's tina/config.ts.

import { fileURLToPath } from 'node:url';

// Vite is an optional peer: report it missing with the fix, rethrow anything else.
const { createServer } = await import('vite').catch((cause) => {
  if (cause?.code !== 'ERR_MODULE_NOT_FOUND') throw cause;
  console.error(
    'tinacms: this command needs Vite to read tina/config.ts.\n' +
      'Install it in your project:  npm i -D vite'
  );
  process.exit(1);
});

const server = await createServer({
  configFile: false,
  logLevel: 'warn',
  // ws: false, or middleware-mode Vite binds its default HMR port 24678 globally
  // and two CLI runs race. load-config.ts guards the same way.
  server: { middlewareMode: true, hmr: false, ws: false, watch: null },
});

try {
  const { runCli } = await server.ssrLoadModule(
    fileURLToPath(new URL('../src/cli/index.ts', import.meta.url))
  );
  process.exitCode = await runCli(process.argv.slice(2));
} finally {
  await server.close();
}
