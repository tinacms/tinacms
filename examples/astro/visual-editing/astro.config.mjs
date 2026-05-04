import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'server',
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
