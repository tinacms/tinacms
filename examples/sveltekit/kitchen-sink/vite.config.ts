import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import adapterNode from '@sveltejs/adapter-node';
import adapterStatic from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { tinaVitePlugin } from '@tinacms/sveltekit/vite';

const isStaticBuild = process.env.TINA_STATIC_BUILD === 'true';
// Set by the GitHub Pages workflow, e.g. "/my-repo"; empty for root deployments.
const basePath = (process.env.BASE_PATH ?? '') as '' | `/${string}`;

export default defineConfig({
  plugins: [
    sveltekit({
      compilerOptions: {
        // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
        runes: ({ filename }) =>
          filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
      },
      // Absolute URLs: page-relative ones (SvelteKit's default) break when the same data is
      // rendered at another depth, e.g. after client-side navigation or live preview updates.
      paths: { base: basePath, relative: false },
      adapter: isStaticBuild
        ? adapterStatic({
            pages: 'build-static',
            assets: 'build-static',
            fallback: '404.html',
            strict: false,
          })
        : adapterNode(),
    }),
    ...(!isStaticBuild ? [tinaVitePlugin()] : []),
  ],
  test: {
    expect: { requireAssertions: true },
    projects: [
      {
        extends: './vite.config.ts',
        test: {
          name: 'client',
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium', headless: true }],
          },
          include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
          exclude: ['src/lib/server/**'],
        },
      },
      {
        extends: './vite.config.ts',
        test: {
          name: 'server',
          environment: 'node',
          include: ['src/**/*.{test,spec}.{js,ts}'],
          exclude: ['src/**/*.svelte.{test,spec}.{js,ts}'],
        },
      },
    ],
  },
});
