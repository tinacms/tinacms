// Point the public import strings at the source of the package, so the playground uses
// the same specifiers that a real app uses. It does not use a relative path into src/.
// The longer subpath must come first.
//
// This is its own module, because two servers need it. Those are the dev server, and the
// temporary server that loadTinaConfig starts to read tina/config.ts. A real app needs
// neither, because it resolves @tinacms/tinacms from node_modules.

import { fileURLToPath } from 'node:url';

const source = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export const playgroundAliases = [
  {
    find: '@tinacms/tinacms/react',
    replacement: source('../src/editor/index.ts'),
  },
  {
    find: '@tinacms/tinacms/admin',
    replacement: source('../src/admin/index.ts'),
  },
  {
    find: '@tinacms/tinacms/adapters/react',
    replacement: source('../src/adapters/react/index.ts'),
  },
  { find: '@tinacms/tinacms', replacement: source('../src/index.ts') },
];
