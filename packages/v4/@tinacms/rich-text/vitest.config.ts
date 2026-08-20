/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    testTimeout: 30_000,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      // plate-ui is regenerated registry output, not code this package owns.
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/plate/components/plate-ui/**',
        'src/**/types.ts',
      ],
      // Low because no test mounts `RichEditor`. The toolbar tree loads with
      // it, so one mount moves this a long way.
      thresholds: { statements: 48, branches: 78, functions: 53, lines: 48 },
    },
  },
});
