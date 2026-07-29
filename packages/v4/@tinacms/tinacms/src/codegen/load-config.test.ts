import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { Server } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { loadTinaConfig } from './load-config';

// v4 mounts into the server that the host app already runs. The RPC handler goes through
// a framework adapter, and the local data layer goes through a middleware. No code under
// src/ therefore owns a port. A read of the config file is the easiest place to lose that
// property, because it starts a Vite server. In middleware mode, Vite has no HTTP server
// for the HMR socket, so it binds its default port, 24678, on every interface. The
// `hmr: false` option does not stop that. Two loads at the same time then race for one
// fixed global port, and one of them fails.
//
// This test asserts the property, and not the flag that gives it today.
let rootDir: string;
let listened: unknown[][];

// http.Server inherits listen from net.Server, so a patch on the one prototype sees every
// socket that either class would open.
const realListen = Server.prototype.listen;

beforeEach(async () => {
  rootDir = await mkdtemp(path.join(tmpdir(), 'tina-load-config-'));
  listened = [];
  Server.prototype.listen = function (
    this: Server,
    ...args: Parameters<typeof realListen>
  ) {
    listened.push(args);
    // Call the original. A regression must fail this assertion. The loader must not
    // behave differently in a test and in production.
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

  // This assertion stops the port check below from passing because the loader stopped
  // early and started nothing.
  expect(config.schema.collections).toEqual([]);
  expect(listened).toEqual([]);
});

// The server this function opens is its own, and it closes it. A server the caller
// passed belongs to the caller, who may still be using it for the rest of a command.
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

// Without a root the server sits at process.cwd(), so a config loaded from anywhere
// else resolves its relative imports against the caller's directory. `tinacms codegen
// --root <dir>` is exactly that case.
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
