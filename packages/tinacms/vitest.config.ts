/// <reference types="vitest" />
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    poolOptions: {
      forks: {
        // node >=23 otherwise injects a broken globalThis.localStorage that shadows
        // happy-dom's, leaving window.localStorage undefined.
        execArgv: ['--no-experimental-webstorage'],
      },
    },
  },
  resolve: {
    alias: {
      '@toolkit': path.resolve(__dirname, './src/toolkit'),
      '@tinacms/toolkit': path.resolve(__dirname, 'src/toolkit/index.ts'),
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
  },
});
