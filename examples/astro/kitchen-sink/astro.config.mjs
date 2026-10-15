import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import tinaDirective from './astro-tina-directive/register.js';

export default defineConfig({
  integrations: [react(), mdx(), tinaDirective()],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      // react-icons uses a directory import that Node ESM doesn't support.
      // Telling Vite to bundle it during SSR avoids the resolution error.
      noExternal: ['react-icons'],
    },
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
