// Point the public import strings at the package source, so the playground exercises
// the same specifiers a real app will use (not relative paths into src/). The more
// specific subpath must come first.
//
// Its own module because two servers need it: the dev server, and the throwaway one
// loadTinaConfig spins up to read tina/config.ts. A real app needs neither — it
// resolves @tinacms/tinacms from node_modules.

import { fileURLToPath } from 'node:url';

const source = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export const playgroundAliases = [
  {
    find: '@tinacms/tinacms/react',
    replacement: source('../src/editor/index.ts'),
  },
  {
    find: '@tinacms/tinacms/adapters/react',
    replacement: source('../src/adapters/react/index.ts'),
  },
  { find: '@tinacms/tinacms', replacement: source('../src/index.ts') },
];
