import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { Server } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { loadTinaConfig } from './load-config';

let rootDir: string;
let listened: unknown[][];

const realListen = Server.prototype.listen;

beforeEach(async () => {
  rootDir = await mkdtemp(path.join(tmpdir(), 'tina-load-config-'));
  listened = [];
  Server.prototype.listen = function (
    this: Server,
    ...args: Parameters<typeof realListen>
  ) {
    listened.push(args);
    return realListen.apply(this, args);
  } as typeof realListen;
});

afterEach(() => {
  Server.prototype.listen = realListen;
});

it('loads a config without binding a port', async () => {
  const configPath = path.join(rootDir, 'config.ts');
  await writeFile(
    configPath,
    'export default { plugins: [], schema: { collections: [] } };\n'
  );

  const config = await loadTinaConfig(configPath);

  expect(config.schema.collections).toEqual([]);
  expect(listened).toEqual([]);
});

it('leaves a caller-supplied loader open', async () => {
  const configPath = path.join(rootDir, 'config.ts');
  await writeFile(
    configPath,
    'export default { plugins: [], schema: { collections: [] } };\n'
  );
  const close = vi.fn(async () => {});
  const loader = {
    ssrLoadModule: async () => ({
      default: { plugins: [], schema: { collections: [] } },
    }),
    close,
  };

  await loadTinaConfig(configPath, {
    loader: loader as unknown as Parameters<typeof loadTinaConfig>[1]['loader'],
  });

  expect(close).not.toHaveBeenCalled();
});

it('resolves a relative import against the config directory, not the cwd', async () => {
  const projectDir = path.join(rootDir, 'site', 'tina');
  await mkdir(projectDir, { recursive: true });
  await writeFile(
    path.join(projectDir, 'collections.ts'),
    'export const collections = [{ name: "posts", label: "Posts", path: "content/posts", format: "mdx", fields: [] }];\n'
  );
  const configPath = path.join(projectDir, 'config.ts');
  await writeFile(
    configPath,
    'import { collections } from "./collections";\n' +
      'export default { plugins: [], schema: { collections } };\n'
  );

  const config = await loadTinaConfig(configPath);

  expect(config.schema.collections.map((one) => one.name)).toEqual(['posts']);
});
