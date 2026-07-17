/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    // Must exceed setup.ts's 5s asyncUtilTimeout, or a failing findBy* dies as
    // a generic vitest timeout with no testing-library DOM dump.
    testTimeout: 10_000,
    poolOptions: {
      forks: {
        // node ≥23 otherwise injects a broken globalThis.localStorage that shadows happy-dom's
        execArgv: ['--no-experimental-webstorage'],
      },
    },
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
