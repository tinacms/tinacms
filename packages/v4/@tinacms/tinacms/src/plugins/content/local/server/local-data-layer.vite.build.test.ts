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

const bundledCode = async (): Promise<string> => {
  const result = await build({
    root: barebones,
    configFile: false,
    logLevel: 'silent',
    plugins: [
      tinaLocalDataLayerVitePlugin({ rootDir: barebones, collections: [] }),
    ],
    build: {
      write: false,
      rollupOptions: {
        input: path.join(barebones, 'tina/config.ts'),
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
});
