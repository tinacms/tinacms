import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { loadTinaConfig } from '../src/codegen/load-config';
import { tinaLocalDataLayerVitePlugin } from '../src/plugins/content/local/local-data-layer.vite';
import { playgroundAliases } from './aliases';

// The data layer indexes the collections that the forms render, so both read one
// declaration. This file loads that declaration in node, and app.tsx imports it in the
// browser.
const tina = await loadTinaConfig(
  fileURLToPath(new URL('./tina/config.ts', import.meta.url)),
  { alias: playgroundAliases }
);

export default defineConfig({
  plugins: [
    // The React Compiler memoises what this package's components would otherwise
    // memoise by hand. It reaches the workspace packages too (@tinacms/ui and
    // @tinacms/rich-text resolve to their source, not to node_modules), so the
    // playground is the whole editor compiled. Consumers don't inherit it: v4
    // still exports source, so it's their bundler that decides.
    react({ babel: { plugins: ['babel-plugin-react-compiler'] } }),
    tailwindcss(),
    tinaLocalDataLayerVitePlugin({
      rootDir: fileURLToPath(new URL('.', import.meta.url)),
      collections: tina.schema.collections,
    }),
  ],
  resolve: { alias: playgroundAliases },
});
