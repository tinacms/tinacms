/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react({ babel: { plugins: ['babel-plugin-react-compiler'] } })],
  test: {
    globals: true,
    environment: 'happy-dom',
    testTimeout: 30_000,
    poolOptions: {
      forks: {
        execArgv: ['--no-experimental-webstorage'],
      },
    },
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      // A file of types alone reports as uncovered, because it emits no
      // runtime code. The test helpers are not the subject of a measurement.
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/**/types.ts',
        'src/**/contract.ts',
        'src/core/brand.ts',
      ],
    },
  },
});
