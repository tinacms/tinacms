import path from 'node:path';
import { build } from 'vite';
import { describe, expect, it } from 'vitest';
import { tinaLocalDataLayerVitePlugin } from './local-data-layer.vite';

const barebones = path.resolve(
  __dirname,
  '../../../../../../../examples/barebones'
);

// A string that only tina/slug.server.ts holds.
const SERVER_MARKER = 'belongs to a route of this site';

const bundledCode = async (
  entry: { id: string; code: string } | undefined = undefined
): Promise<string> => {
  const result = await build({
    root: barebones,
    configFile: false,
    logLevel: 'silent',
    plugins: [
      tinaLocalDataLayerVitePlugin({ rootDir: barebones, collections: [] }),
      ...(entry
        ? [
            {
              name: 'virtual-entry',
              resolveId: (id: string) => (id === entry.id ? entry.id : null),
              load: (id: string) => (id === entry.id ? entry.code : null),
            },
          ]
        : []),
    ],
    build: {
      write: false,
      rollupOptions: {
        input: entry?.id ?? path.join(barebones, 'tina/config.ts'),
        onwarn: () => {},
      },
    },
  });
  const outputs = Array.isArray(result) ? result : [result];
  return outputs
    .filter((output) => 'output' in output)
    .flatMap(({ output }) => output)
    .map((file) => (file.type === 'chunk' ? file.code : String(file.source)))
    .join('\n');
};

describe('tinaLocalDataLayerVitePlugin client build', () => {
  it('keeps the server side of a hook out of the barebones admin bundle', async () => {
    const code = await bundledCode();
    expect(code).toContain('example:hooks');
    expect(code).not.toContain(SERVER_MARKER);
  }, 120_000);

  it('keeps node modules out of the bundle of a defineSearchPlugin plugin', async () => {
    const server = path.resolve(
      __dirname,
      '../../../../test/in-memory-search.server.ts'
    );
    const code = await bundledCode({
      id: 'virtual:search-entry',
      code: `import { defineSearchPlugin, searchIndex } from '@tinacms/tinacms';
import { createSearchClient } from '@tinacms/tinacms/client';
export default [
  defineSearchPlugin({
    name: 'example:search',
    fields: { post: { title: 1 } },
    server: () => import(${JSON.stringify(server)}),
  }),
  searchIndex(),
  createSearchClient,
];`,
    });
    expect(code).toContain('example:search');
    expect(code).not.toContain('async_hooks');
    expect(code).not.toContain('AsyncLocalStorage');
  }, 120_000);
});
