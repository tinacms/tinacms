import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { type ResolvedConfig, asResolvedConfig } from '../../config';
import { definePlugin } from '../../core/plugin';
import { LOCK_FILENAME, TINA_DIRECTORY, runCodegen } from './codegen';

// These tests use a real temporary directory, and not a mock file system. The behaviour
// under test is what reaches the disk. An unchanged lock is not written again, and a
// failed run leaves the committed file as it is.
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

// This stands in for the Vite server that the bin lends to the CLI. These tests then
// cover the disk behaviour of runCodegen, and start no server for each case.
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

  // The lock is committed. A write of an identical file would put it in `git status`
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

  // A hand edit, or a bad merge, leaves nothing to compare against. The command
  // therefore compiles again, and does not fail in JSON.parse.
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

describe('runCodegen on a lock it cannot trust', () => {
  // These parse but are not a lock. The cast alone let them reach checkLock, which
  // then threw a TypeError on `lock.primitives[type]` instead of recompiling.
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

  // --config can point outside tina/, so the lock's directory is not a given.
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
