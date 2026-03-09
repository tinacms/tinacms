/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    coverage: {
      include: ['src/database/datalayer.ts', 'src/database/index.ts'],
    },
  },
});
