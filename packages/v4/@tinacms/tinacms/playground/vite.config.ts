import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Aliases point the public import strings at the package source, so the playground
// exercises the same specifiers a real app will use (not relative paths into src/).
// Array form: the more specific subpath must come first.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@tinacms/tinacms/react',
        replacement: fileURLToPath(
          new URL('../src/editor/index.ts', import.meta.url)
        ),
      },
      {
        find: '@tinacms/tinacms/preview',
        replacement: fileURLToPath(
          new URL('../src/preview/index.ts', import.meta.url)
        ),
      },
      {
        find: '@tinacms/tinacms',
        replacement: fileURLToPath(new URL('../src/index.ts', import.meta.url)),
      },
    ],
  },
});
