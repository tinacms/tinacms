import { defineConfig } from 'vitest/config'
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
  },
  resolve: {
    alias: {
      '@toolkit': path.resolve(__dirname, './src/toolkit'),
      '@tinacms/toolkit': path.resolve(__dirname, 'src/toolkit/index.ts'),
    },
  },
});
