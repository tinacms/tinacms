import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ResolvedConfig } from '../../config';
import { definePlugin } from '../../core/plugin';
import { LOCK_FILENAME, TINA_DIRECTORY, runCodegen } from './codegen';

// Against a real temp directory rather than a mocked fs: the behaviour under test is
// what lands on disk — that an unchanged lock is not rewritten, and that a failed run
// leaves the committed file alone.
let rootDir: string;
let lockPath: string;

const config = (fields: { name: string; type: string }[]): ResolvedConfig => ({
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

// Stands in for the Vite server the bin lends the CLI, so these tests exercise
// runCodegen's disk behaviour without booting one per case.
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

  // The lock is committed: rewriting an identical file would put it in `git status`
  // after every build.
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
    const bumped: ResolvedConfig = {
      ...config([{ name: 'title', type: 'string' }]),
      plugins: [
        definePlugin({ name: 'test:content', provides: ['content'] }),
        definePlugin({
          name: 'test:field:string',
          provides: ['field'],
          field: { type: 'string', contractVersion: 2 },
        }),
      ],
    };
    await expect(codegen(bumped)).rejects.toThrow(/tina migrate/);
    expect(await readFile(lockPath, 'utf8')).toBe(committed);
  });

  // A hand-edit or a bad merge leaves nothing trustworthy to compare against, so it
  // recompiles rather than failing on JSON.parse.
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
