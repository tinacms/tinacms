import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LOCK_VERSION } from '../../codegen/compile-schema';
import { type ResolvedConfig, asResolvedConfig } from '../../config';
import { definePlugin } from '../../core/plugin';
import {
  LOCK_FILENAME,
  TINA_DIRECTORY,
  findConfigPath,
  runCodegen,
} from './codegen';

let rootDir: string;
let lockPath: string;

const config = (fields: { name: string; type: string }[]): ResolvedConfig =>
  asResolvedConfig({
    plugins: [
      definePlugin({ name: 'test:content', provides: ['content'] }),
      definePlugin({
        name: 'test:field:string',
        provides: ['field'],
        field: { type: 'string', contractVersion: 1 },
      }),
    ],
    schema: {
      collections: [
        { name: 'post', path: 'content/posts', format: 'md', fields },
      ],
    },
  });

const loaderFor = (resolved: ResolvedConfig) => ({
  ssrLoadModule: async () => ({ default: resolved }),
});

const codegen = (resolved: ResolvedConfig) =>
  runCodegen({
    rootDir,
    configPath: path.join(rootDir, TINA_DIRECTORY, 'config.ts'),
    load: { loader: loaderFor(resolved) },
  });

const readLock = async () => JSON.parse(await readFile(lockPath, 'utf8'));

afterEach(async () => {
  await rm(rootDir, { recursive: true, force: true });
});

beforeEach(async () => {
  rootDir = await mkdtemp(path.join(tmpdir(), 'tina-codegen-'));
  await mkdir(path.join(rootDir, TINA_DIRECTORY), { recursive: true });
  lockPath = path.join(rootDir, TINA_DIRECTORY, LOCK_FILENAME);
});

describe('runCodegen', () => {
  it('writes the lock on a first run', async () => {
    const result = await codegen(config([{ name: 'title', type: 'string' }]));
    expect(result.outcome).toBe('created');
    expect((await readLock()).primitives).toEqual({ string: 1 });
  });

  it('leaves an already-current lock untouched', async () => {
    const schema = config([{ name: 'title', type: 'string' }]);
    await codegen(schema);
    const written = await readFile(lockPath, 'utf8');
    const result = await codegen(schema);
    expect(result.outcome).toBe('unchanged');
    expect(await readFile(lockPath, 'utf8')).toBe(written);
  });

  it('regenerates a lock that lags the schema, and says why', async () => {
    await codegen(config([{ name: 'title', type: 'string' }]));
    const result = await codegen(
      config([
        { name: 'title', type: 'string' },
        { name: 'subtitle', type: 'string' },
      ])
    );
    expect(result.outcome).toBe('updated');
    expect(result.warning).toMatch(/out of date/);
    expect((await readLock()).schema.collections[0].fields).toHaveLength(2);
  });

  it('stops on a contract-version mismatch without touching the lock', async () => {
    await codegen(config([{ name: 'title', type: 'string' }]));
    const committed = await readFile(lockPath, 'utf8');
    const bumped = asResolvedConfig({
      ...config([{ name: 'title', type: 'string' }]),
      plugins: [
        definePlugin({ name: 'test:content', provides: ['content'] }),
        definePlugin({
          name: 'test:field:string',
          provides: ['field'],
          field: { type: 'string', contractVersion: 2 },
        }),
      ],
    });
    await expect(codegen(bumped)).rejects.toThrow(/tinacms migrate/);
    expect(await readFile(lockPath, 'utf8')).toBe(committed);
  });

  it('recompiles over an unparseable lock', async () => {
    await writeFile(lockPath, '{ not json');
    const result = await codegen(config([{ name: 'title', type: 'string' }]));
    expect(result.outcome).toBe('created');
    expect((await readLock()).primitives).toEqual({ string: 1 });
  });

  it('reports a project with no config rather than guessing', async () => {
    await expect(
      runCodegen({ rootDir, load: { loader: loaderFor(config([])) } })
    ).rejects.toThrow(/No Tina config found/);
  });
});

describe('findConfigPath', () => {
  it.each(['config.ts', 'config.tsx', 'config.js', 'config.mjs'])(
    'finds %s',
    async (name) => {
      await writeFile(
        path.join(rootDir, TINA_DIRECTORY, name),
        'export default {}'
      );
      expect(await findConfigPath(rootDir)).toBe(
        path.join(rootDir, TINA_DIRECTORY, name)
      );
    }
  );

  it('prefers config.ts when several candidates exist', async () => {
    for (const name of ['config.mjs', 'config.tsx', 'config.ts']) {
      await writeFile(
        path.join(rootDir, TINA_DIRECTORY, name),
        'export default {}'
      );
    }
    expect(await findConfigPath(rootDir)).toBe(
      path.join(rootDir, TINA_DIRECTORY, 'config.ts')
    );
  });
});

describe('runCodegen on a lock it cannot trust', () => {
  it.each([
    ['an array', '[]'],
    ['a number', '3'],
    ['no primitives', '{"version":1}'],
  ])('recompiles over %s', async (_label, contents) => {
    await writeFile(lockPath, contents);
    const result = await codegen(config([{ name: 'title', type: 'string' }]));
    expect(result.outcome).toBe('created');
    expect((await readLock()).primitives).toEqual({ string: 1 });
  });

  it('stops rather than downgrading a lock from a newer tinacms', async () => {
    await codegen(config([{ name: 'title', type: 'string' }]));
    const current = JSON.parse(await readFile(lockPath, 'utf8'));
    await writeFile(
      lockPath,
      JSON.stringify({ ...current, version: current.version + 1 }, null, 2)
    );
    const committed = await readFile(lockPath, 'utf8');

    await expect(
      codegen(config([{ name: 'title', type: 'string' }]))
    ).rejects.toThrow(/Upgrade tinacms/);
    expect(await readFile(lockPath, 'utf8')).toBe(committed);
  });

  it('creates the lock directory when it does not exist', async () => {
    await rm(path.join(rootDir, TINA_DIRECTORY), {
      recursive: true,
      force: true,
    });
    const result = await codegen(config([{ name: 'title', type: 'string' }]));
    expect(result.outcome).toBe('created');
    expect((await readLock()).primitives).toEqual({ string: 1 });
  });
});

describe('runCodegen and the admin route', () => {
  const outcomeOf = (
    result: Awaited<ReturnType<typeof codegen>>,
    suffix: string
  ) => result.admin.find((file) => file.path.endsWith(suffix))?.outcome;

  it('writes public/admin/index.html and scaffolds the entry on a first run', async () => {
    const result = await codegen(config([{ name: 'title', type: 'string' }]));

    expect(outcomeOf(result, path.join('public', 'admin', 'index.html'))).toBe(
      'created'
    );
    expect(outcomeOf(result, path.join('tina', 'admin.tsx'))).toBe('created');
    expect(outcomeOf(result, path.join('tina', 'admin.css'))).toBe('created');
    const html = await readFile(
      path.join(rootDir, 'public', 'admin', 'index.html'),
      'utf8'
    );
    expect(html).toContain('<script type="module" src="/tina/admin.tsx">');
    const entry = await readFile(
      path.join(rootDir, 'tina', 'admin.tsx'),
      'utf8'
    );
    expect(entry).toContain('<TinaAdmin config={config}');
  });

  it('honours build.publicFolder and build.outputFolder from the config', async () => {
    const custom = asResolvedConfig({
      ...config([{ name: 'title', type: 'string' }]),
      build: { publicFolder: 'static', outputFolder: 'cms' },
    });
    const result = await codegen(custom);
    expect(outcomeOf(result, path.join('static', 'cms', 'index.html'))).toBe(
      'created'
    );
  });

  it('keeps every admin file the project edited', async () => {
    const schema = config([{ name: 'title', type: 'string' }]);
    await codegen(schema);
    const entryPath = path.join(rootDir, 'tina', 'admin.tsx');
    const htmlPath = path.join(rootDir, 'public', 'admin', 'index.html');
    const cssPath = path.join(rootDir, 'tina', 'admin.css');
    const edited = '// The project edited this file.\n';
    const editedHtml = '<!doctype html>custom shell';
    const editedCss = '/* The project edited this file. */\n';
    await writeFile(entryPath, edited);
    await writeFile(htmlPath, editedHtml);
    await writeFile(cssPath, editedCss);

    const result = await codegen(schema);

    expect(outcomeOf(result, path.join('tina', 'admin.tsx'))).toBe('kept');
    expect(await readFile(entryPath, 'utf8')).toBe(edited);
    expect(outcomeOf(result, path.join('public', 'admin', 'index.html'))).toBe(
      'kept'
    );
    expect(await readFile(htmlPath, 'utf8')).toBe(editedHtml);
    expect(outcomeOf(result, path.join('tina', 'admin.css'))).toBe('kept');
    expect(await readFile(cssPath, 'utf8')).toBe(editedCss);
  });

  it('scaffolds no admin files when the lock check fails', async () => {
    await writeFile(
      lockPath,
      JSON.stringify({ version: LOCK_VERSION + 1, primitives: { string: 1 } })
    );

    await expect(
      codegen(config([{ name: 'title', type: 'string' }]))
    ).rejects.toThrow(/Upgrade tinacms/);

    for (const file of [
      path.join(rootDir, 'public', 'admin', 'index.html'),
      path.join(rootDir, 'tina', 'admin.tsx'),
      path.join(rootDir, 'tina', 'admin.css'),
    ]) {
      await expect(readFile(file, 'utf8')).rejects.toThrow();
    }
  });

  it('writes nothing under public in check mode', async () => {
    await runCodegen({
      rootDir,
      configPath: path.join(rootDir, TINA_DIRECTORY, 'config.ts'),
      load: { loader: loaderFor(config([{ name: 'title', type: 'string' }])) },
      write: false,
    });
    await expect(
      readFile(path.join(rootDir, 'public', 'admin', 'index.html'), 'utf8')
    ).rejects.toThrow();
  });
});
