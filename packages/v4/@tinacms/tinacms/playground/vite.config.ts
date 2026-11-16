import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { type Plugin, defineConfig } from 'vite';
import { loadTinaConfig } from '../src/codegen/load-config';
import { tinaLocalDataLayerVitePlugin } from '../src/plugins/content/local/server/local-data-layer.vite';
import { playgroundAliases } from './aliases';

const tinaConfigPath = fileURLToPath(
  new URL('./tina/config.ts', import.meta.url)
);

const tina = await loadTinaConfig(tinaConfigPath, {
  alias: playgroundAliases,
});

const restartOnTinaConfigChange = (): Plugin => ({
  name: 'tina-playground-restart-on-config-change',
  configureServer(server) {
    server.watcher.add(tinaConfigPath);
    server.watcher.on('change', (file) => {
      if (file === tinaConfigPath) void server.restart();
    });
  },
});

// Pages the preview toolbar's tests need: a slow one, other statuses, and a site that is down.
const previewFixtures = (): Plugin => {
  const up = new Set<string>();
  const stalled = new Map<string, () => void>();
  const released = new Set<string>();
  return {
    name: 'tina-playground-preview-fixtures',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost');
        if (url.pathname === '/slow.html') {
          const wait = Number(url.searchParams.get('ms') ?? 1500);
          setTimeout(() => {
            res.setHeader('content-type', 'text/html');
            res.end('<h1 data-testid="slow-title">Slow page</h1>');
          }, wait);
        } else if (
          url.pathname === '/status/404' ||
          url.pathname === '/status/500'
        ) {
          res.statusCode = Number(url.pathname.split('/').pop());
          res.setHeader('content-type', 'text/html');
          res.end(
            `<h1 data-testid="status-title">Site says ${res.statusCode}</h1>`
          );
        } else if (url.pathname === '/down.html') {
          const key = url.searchParams.get('key') ?? '';
          if (up.has(key)) {
            res.setHeader('content-type', 'text/html');
            res.end('<h1 data-testid="down-title">Site is up</h1>');
          } else {
            req.socket.destroy();
          }
        } else if (url.pathname === '/hang.html') {
          // Accepts the request and never answers.
        } else if (url.pathname === '/stall.html') {
          // Holds the request until /__release, then drops the connection, as a dev server that dies does.
          const key = url.searchParams.get('key') ?? '';
          if (released.has(key)) req.socket.destroy();
          else stalled.set(key, () => req.socket.destroy());
        } else if (url.pathname === '/__release') {
          const key = url.searchParams.get('key') ?? '';
          released.add(key);
          stalled.get(key)?.();
          res.end('ok');
        } else if (url.pathname === '/__up') {
          up.add(url.searchParams.get('key') ?? '');
          res.end('ok');
        } else {
          next();
        }
      });
    },
  };
};

export default defineConfig({
  plugins: [
    previewFixtures(),
    react({ babel: { plugins: ['babel-plugin-react-compiler'] } }),
    tailwindcss(),
    tinaLocalDataLayerVitePlugin({
      rootDir: fileURLToPath(new URL('.', import.meta.url)),
      config: tina,
    }),
    restartOnTinaConfigChange(),
  ],
  resolve: { alias: playgroundAliases },
  // `@tinacms/mdx` resolves through a workspace symlink, so Vite reads it as
  // linked source and leaves it out of the dependency pre-bundle. Babel then
  // parses two megabytes of built output on the first request for it. It is a
  // built file, so nothing wants source-level HMR from it.
  optimizeDeps: { include: ['@tinacms/mdx'] },
});
