#!/usr/bin/env node
// The bin is JavaScript, and the CLI that it runs is TypeScript. Vite loads that
// TypeScript, and node does not strip the types. Node can strip the types, but it cannot
// follow the relative imports of this package, which have no extension. The `exports`
// field still points at the raw source, because ADR-001 has not decided the dist build.
//
// This server loads the CLI, and only the CLI. It is rooted at this package, so it must
// not also read the user's tina/config.ts: that config resolves its relative imports and
// tsconfig paths against the project, which `--root` can put anywhere. The CLI therefore
// opens its own server for the config, rooted at the directory the config sits in.

import { fileURLToPath } from 'node:url';

// Vite is an optional peer, because the browser runtime of this package does not need a
// build tool and should not install one. The bin does need it, for the reason above, so
// this reports the missing peer as the instruction it is. The `catch` goes when ADR-001
// lands the dist build: from then the bin loads compiled JavaScript, and only the config
// read needs a loader.
const { createServer } = await import('vite').catch(() => {
  console.error(
    'tinacms: this command needs Vite to read tina/config.ts.\n' +
      'Install it in your project:  npm i -D vite'
  );
  process.exit(1);
});

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
  process.exitCode = await runCli(process.argv.slice(2));
} finally {
  await server.close();
}
