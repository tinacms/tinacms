import { createServer } from 'vite';
import path from 'node:path';
import { expect, it } from 'vitest';

// The first save imports each plugin's lazy `server` segment through the loader that
// read the playground's tina/config.ts (ADR-007). If the Vite config closes that loader
// after reading, the save fails with "Vite module runner has been closed".
it('saves through the playground dev server, so its lazy server segments still load', async () => {
  const server = await createServer({
    configFile: path.resolve(__dirname, '../../playground/vite.config.ts'),
    server: { port: 0, hmr: false },
    logLevel: 'silent',
  });
  try {
    await server.listen();
    const address = server.httpServer?.address();
    if (!address || typeof address === 'string') throw new Error('no port');
    const origin = `http://localhost:${address.port}`;
    const response = await fetch(`${origin}/api/tina/content/update`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin },
      body: JSON.stringify({
        collection: 'author',
        path: 'content/authors/probe.md',
        value: { name: '' },
      }),
    });
    const body = await response.json();
    expect(response.status).toBe(422);
    expect(body.error.code).toBe('validation');
  } finally {
    await server.close();
  }
}, 60_000);
