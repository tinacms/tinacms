import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tinaDirective from './astro-tina-directive/register.js';

export default defineConfig({
  integrations: [react(), mdx(), tinaDirective()],
  vite: {
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          // Suppress UNUSED_EXTERNAL_IMPORT from TinaCMS generated files
          // TODO: Remove once https://github.com/tinacms/tinacms/issues/6386 is fixed
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
