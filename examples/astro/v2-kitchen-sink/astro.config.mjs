import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
import tina from '@tinacms/astro/integration';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [mdx(), tina()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      // Vite's default `fs.deny` includes `**/.git/**`, which blocks the
      // entire dev server when the project is checked out under
      // `.git/worktrees/...` (a common multi-branch dev pattern). Override
      // with the rest of the default deny list intact — only the `.git`
      // entry is removed. The default `fs.allow` (auto-detected workspace
      // root) is preserved, so `/@fs/...` still rejects out-of-workspace paths.
      fs: { deny: ['.env', '.env.*', '*.{crt,pem}'] },
    },
    // Bundle the workspace TinaCMS packages into the SSR build instead of
    // resolving them per-module on every cold request. Without this, each
    // `import TinaMarkdown from '@tinacms/astro/TinaMarkdown.astro'` triggers a full Vite
    // resolution + Astro-plugin compile of the package's source `.astro`
    // files (Node, Container, Leaf, Link, Image, MdxNode, etc.).
    ssr: {
      noExternal: ['@tinacms/astro', '@tinacms/bridge'],
    },
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          // Suppress UNUSED_EXTERNAL_IMPORT from TinaCMS generated files
          // (upstream: https://github.com/tinacms/tinacms/issues/6386)
          if (
            warning.code === 'UNUSED_EXTERNAL_IMPORT' &&
            warning.exporter === 'tinacms/dist/client'
          ) {
            return;
          }
          warn(warning);
        },
      },
    },
  },
});
