import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { type Connect, type Plugin, defineConfig } from 'vite';
import {
  createLocalDataLayer,
  handleContentRequest,
} from '../src/plugins/content/local/local-data-layer';
import { postCollectionMeta } from './src/collection-meta';

// The Local Data Layer (ADR-018): the dev server hosts the content endpoint the
// localContentPlugin slice talks to; saves write the real files under
// playground/content/. Only the file mapping matters here, so the middleware
// takes the import-free collection-meta module, not the app's full schema.
const localDataLayerPlugin = (): Plugin => {
  const dataLayer = createLocalDataLayer({
    rootDir: fileURLToPath(new URL('.', import.meta.url)),
    collections: [{ ...postCollectionMeta, fields: [] }],
  });
  const handle: Connect.NextHandleFunction = (req, res) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', async () => {
      try {
        const result = await handleContentRequest(dataLayer, JSON.parse(body));
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify(result));
      } catch (cause) {
        res.statusCode = 400;
        res.end(cause instanceof Error ? cause.message : String(cause));
      }
    });
  };
  return {
    name: 'tina-local-data-layer',
    configureServer(server) {
      server.middlewares.use('/api/tina/content', handle);
    },
  };
};

// Aliases point the public import strings at the package source, so the playground
// exercises the same specifiers a real app will use (not relative paths into src/).
// Array form: the more specific subpath must come first.
export default defineConfig({
  plugins: [react(), tailwindcss(), localDataLayerPlugin()],
  resolve: {
    alias: [
      {
        find: '@tinacms/tinacms/react',
        replacement: fileURLToPath(
          new URL('../src/editor/index.ts', import.meta.url)
        ),
      },
      {
        find: '@tinacms/tinacms/adapters/react',
        replacement: fileURLToPath(
          new URL('../src/adapters/react/index.ts', import.meta.url)
        ),
      },
      {
        find: '@tinacms/tinacms',
        replacement: fileURLToPath(new URL('../src/index.ts', import.meta.url)),
      },
    ],
  },
});
