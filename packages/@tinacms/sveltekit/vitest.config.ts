import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [svelte()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'server',
          environment: 'node',
          include: ['src/**/*.test.ts'],
          exclude: ['src/**/*.svelte.test.ts'],
        },
      },
      {
        extends: true,
        resolve: { conditions: ['browser'] },
        test: {
          name: 'dom',
          environment: 'happy-dom',
          environmentOptions: { happyDOM: { url: 'http://localhost:5173' } },
          include: ['src/**/*.svelte.test.ts'],
        },
      },
    ],
  },
});
