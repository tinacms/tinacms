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
