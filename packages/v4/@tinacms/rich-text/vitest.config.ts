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
      // `plate/components/plate-ui` is the shadcn and Plate registry output.
      // A person regenerates it, and does not write a test for it, so it does
      // not belong in a measurement of the code this package owns.
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/plate/components/plate-ui/**',
        'src/**/types.ts',
      ],
    },
  },
});
