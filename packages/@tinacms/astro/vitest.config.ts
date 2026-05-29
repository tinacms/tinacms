/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    globals: true,
    include: ['src/**/*.test.ts'],
    typecheck: {
      enabled: true,
      include: ['src/**/*.test-d.ts'],
    },
  },
});
