import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  vite: {
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          // Suppress UNUSED_EXTERNAL_IMPORT from TinaCMS generated files
          // (upstream: https://github.com/tinacms/tinacms/issues/6386)
          if (
            warning.code === 'UNUSED_EXTERNAL_IMPORT' &&
            warning.exporter === 'tinacms/dist/client'
          ) {
            return;
          }
          warn(warning);
        },
      },
    },
  },
});
