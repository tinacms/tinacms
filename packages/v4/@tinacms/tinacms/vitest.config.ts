/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react({ babel: { plugins: ['babel-plugin-react-compiler'] } })],
  test: {
    globals: true,
    environment: 'happy-dom',
    testTimeout: 30_000,
    // beforeAll warms plugin client segments, so a cold Vite transform lands here.
    hookTimeout: 30_000,
    poolOptions: {
      forks: {
        execArgv: ['--no-experimental-webstorage'],
      },
    },
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
