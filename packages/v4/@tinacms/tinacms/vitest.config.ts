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
      // A types-only file emits no runtime code, so it always reads uncovered.
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/**/types.ts',
        'src/**/contract.ts',
        'src/core/brand.ts',
      ],
      // Under the measured figure: the React compiler rewrites a component
      // before v8 counts it, so a report understates what the tests run.
      thresholds: { statements: 95, branches: 90, functions: 94, lines: 95 },
    },
  },
});
