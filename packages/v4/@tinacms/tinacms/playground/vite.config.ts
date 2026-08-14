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

export default defineConfig({
  plugins: [
    react({ babel: { plugins: ['babel-plugin-react-compiler'] } }),
    tailwindcss(),
    tinaLocalDataLayerVitePlugin({
      rootDir: fileURLToPath(new URL('.', import.meta.url)),
      collections: tina.schema.collections,
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
