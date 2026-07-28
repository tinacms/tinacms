import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { loadTinaConfig } from '../src/codegen/load-config';
import { tinaLocalDataLayerVitePlugin } from '../src/plugins/content/local/local-data-layer.vite';
import { playgroundAliases } from './aliases';

// The data layer indexes the collections the forms render, so both read the one
// declaration — this loads it in node, app.tsx imports it in the browser.
const tina = await loadTinaConfig(
  fileURLToPath(new URL('./tina/config.ts', import.meta.url)),
  { alias: playgroundAliases }
);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tinaLocalDataLayerVitePlugin({
      rootDir: fileURLToPath(new URL('.', import.meta.url)),
      collections: tina.schema.collections,
    }),
  ],
  resolve: { alias: playgroundAliases },
});
