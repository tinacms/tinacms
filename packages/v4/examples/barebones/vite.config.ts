// The Vite config of the app. It shows the v4 shape: the project owns its pipeline, and
// Tina mounts into it. `pnpm dev` runs Vite, and only Vite. There is no `tinacms dev`.
//
// The config loads tina/config.ts in node, and hands the collections to the local data
// layer plugin. The browser code imports the same file, so the schema is declared once.

import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
// TEMPORARY (ADR-001). These two run in node, and node cannot load them through the
// package name yet: `exports` points at raw .ts whose relative imports carry no
// extension, and Vite externalizes every bare import of this file to node. A relative
// import is bundled by esbuild instead, which follows those imports. When the dist build
// lands, these become:
//   import { loadTinaConfig } from '@tinacms/tinacms/...';
//   import { tinaLocalDataLayerVitePlugin } from '@tinacms/tinacms/local-data-layer/vite';
import { loadTinaConfig } from '../../@tinacms/tinacms/src/codegen/load-config';
import { tinaLocalDataLayerVitePlugin } from '../../@tinacms/tinacms/src/plugins/content/local/server/local-data-layer.vite';

const tina = await loadTinaConfig(
  fileURLToPath(new URL('./tina/config.ts', import.meta.url))
);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // The whole Tina setup. The plugin serves the local data layer, and on dev it
    // runs codegen: public/admin/index.html (the admin shell), the tina/admin.tsx
    // entry, and tina/tina-lock.json. Open /admin/ — nothing else to mount.
    tinaLocalDataLayerVitePlugin({
      rootDir: fileURLToPath(new URL('.', import.meta.url)),
      config: tina,
    }),
  ],
});
