import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { asResolvedConfig } from '../config';
import { definePlugin } from '../core/plugin';
import { runCli } from './index';

let rootDir: string;

const resolved = asResolvedConfig({
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
      {
        name: 'post',
        path: 'content/posts',
        format: 'md',
        fields: [{ name: 'title', type: 'string' }],
      },
    ],
  },
});

const capture = () => {
  const out: string[] = [];
  const err: string[] = [];
  return {
    out,
    err,
    context: {
      cwd: rootDir,
      log: (message: string) => out.push(message),
      logError: (message: string) => err.push(message),
      loader: { ssrLoadModule: async () => ({ default: resolved }) },
    },
  };
};

afterEach(async () => {
  await rm(rootDir, { recursive: true, force: true });
});

beforeEach(async () => {
  rootDir = await mkdtemp(path.join(tmpdir(), 'tina-cli-'));
  await mkdir(path.join(rootDir, 'tina'), { recursive: true });
});

describe('runCli', () => {
  it('runs codegen against the working directory', async () => {
    const { out, context } = capture();
    await writeFile(
      path.join(rootDir, 'tina', 'config.ts'),
      'export default {}'
    );

    expect(await runCli(['codegen'], context)).toBe(0);
    expect(out.join('\n')).toMatch(/Wrote .*tina-lock\.json/);
    const lock = JSON.parse(
      await readFile(path.join(rootDir, 'tina', 'tina-lock.json'), 'utf8')
    );
    expect(lock.primitives).toEqual({ string: 1 });
  });

  it('runs init against the working directory, and a second run keeps the files', async () => {
    const { out, context } = capture();

    expect(await runCli(['init'], context)).toBe(0);
    const output = out.join('\n');
    expect(output).toMatch(/Wrote .*tina[/\\]config\.ts/);
    expect(output).toMatch(/Wrote .*hello-world\.mdx/);
    expect(output).toContain('/admin/');
    expect(
      await readFile(path.join(rootDir, 'tina', 'config.ts'), 'utf8')
    ).toContain('defineConfig(');

    const second = capture();
    expect(await runCli(['init'], second.context)).toBe(0);
    expect(second.out.join('\n')).toMatch(/Kept .*tina[/\\]config\.ts/);
  });

  it('resolves init --root relative to the working directory', async () => {
    const { context } = capture();

    expect(await runCli(['init', '--root', 'site'], context)).toBe(0);
    expect(
      await readFile(path.join(rootDir, 'site', 'tina', 'config.ts'), 'utf8')
    ).toContain('defineConfig(');
  });

  it('resolves --root relative to the working directory', async () => {
    const { out, context } = capture();
    const nested = path.join(rootDir, 'site');
    await mkdir(path.join(nested, 'tina'), { recursive: true });
    await writeFile(
      path.join(nested, 'tina', 'config.ts'),
      'export default {}'
    );

    expect(await runCli(['codegen', '--root', 'site'], context)).toBe(0);
    expect(out.join('\n')).toContain(
      path.join(nested, 'tina', 'tina-lock.json')
    );
  });

  it('reads the config named by --config and writes the lock under tina/', async () => {
    const { out, context } = capture();
    await rm(path.join(rootDir, 'tina'), { recursive: true, force: true });
    await writeFile(path.join(rootDir, 'cms.config.ts'), 'export default {}');

    expect(
      await runCli(['codegen', '--config', 'cms.config.ts'], context)
    ).toBe(0);
    expect(out.join('\n')).toMatch(/Wrote .*tina-lock\.json/);
    const lock = JSON.parse(
      await readFile(path.join(rootDir, 'tina', 'tina-lock.json'), 'utf8')
    );
    expect(lock.primitives).toEqual({ string: 1 });
  });

  it('reports a missing config as a message, not a crash', async () => {
    const { err, context } = capture();
    expect(await runCli(['codegen'], context)).toBe(1);
    expect(err.join('\n')).toMatch(/No Tina config found/);
  });

  it('rejects an unknown command with the usage text', async () => {
    const { err, context } = capture();
    expect(await runCli(['publish'], context)).toBe(1);
    expect(err.join('\n')).toMatch(/Unknown command "publish"/);
  });

  it('prints usage for --help', async () => {
    const { out, context } = capture();
    expect(await runCli(['--help'], context)).toBe(0);
    expect(out.join('\n')).toContain('tinacms <command>');
  });

  it('exits non-zero when given no command', async () => {
    const { out, context } = capture();
    expect(await runCli([], context)).toBe(1);
    expect(out.join('\n')).toContain('tinacms <command>');
  });
});

describe('runCli codegen --check', () => {
  const writeConfig = () =>
    writeFile(path.join(rootDir, 'tina', 'config.ts'), 'export default {}');
  const lockPath = () => path.join(rootDir, 'tina', 'tina-lock.json');

  it('exits 0 when the committed lock matches the schema', async () => {
    const { context } = capture();
    await writeConfig();
    await runCli(['codegen'], context);

    const { out, context: checkContext } = capture();
    expect(await runCli(['codegen', '--check'], checkContext)).toBe(0);
    expect(out.join('\n')).toMatch(/is up to date/);
  });

  it('exits 1 and writes nothing when no lock is committed', async () => {
    const { err, context } = capture();
    await writeConfig();

    expect(await runCli(['codegen', '--check'], context)).toBe(1);
    expect(err.join('\n')).toMatch(/is out of date/);
    await expect(readFile(lockPath(), 'utf8')).rejects.toThrow();
  });

  it('exits 1 and leaves a stale lock untouched', async () => {
    const { context } = capture();
    await writeConfig();
    await runCli(['codegen'], context);
    const committed = JSON.parse(await readFile(lockPath(), 'utf8'));
    committed.schema.collections[0].fields.push({
      name: 'subtitle',
      type: 'string',
    });
    const stale = `${JSON.stringify(committed, null, 2)}\n`;
    await writeFile(lockPath(), stale);

    const { err, context: checkContext } = capture();
    expect(await runCli(['codegen', '--check'], checkContext)).toBe(1);
    expect(err.join('\n')).toMatch(/is out of date/);
    expect(await readFile(lockPath(), 'utf8')).toBe(stale);
  });
});

describe('runCli argument handling', () => {
  it('reports an unknown flag as a message rather than throwing', async () => {
    const { err, context } = capture();
    await writeFile(
      path.join(rootDir, 'tina', 'config.ts'),
      'export default {}'
    );
    await expect(runCli(['codegen', '--bogus'], context)).resolves.toBe(1);
    expect(err.join('\n')).not.toBe('');
  });

  it('reports a flag given without its value', async () => {
    const { context } = capture();
    await expect(runCli(['codegen', '--root'], context)).resolves.toBe(1);
  });

  it('exits non-zero for an unknown command even with --help', async () => {
    const { err, context } = capture();
    expect(await runCli(['publish', '--help'], context)).toBe(1);
    expect(err.join('\n')).toMatch(/Unknown command "publish"/);
  });

  it('treats an absolute --root as absolute', async () => {
    const { out, context } = capture();
    const elsewhere = await mkdtemp(path.join(tmpdir(), 'tina-abs-'));
    await mkdir(path.join(elsewhere, 'tina'), { recursive: true });
    await writeFile(
      path.join(elsewhere, 'tina', 'config.ts'),
      'export default {}'
    );

    expect(await runCli(['codegen', '--root', elsewhere], context)).toBe(0);
    expect(out.join('\n')).toContain(
      path.join(elsewhere, 'tina', 'tina-lock.json')
    );
    await rm(elsewhere, { recursive: true, force: true });
  });
});
