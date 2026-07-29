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

// This captures what a developer sees, and keeps it out of the test runner output.
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
    // The lookup for the config file reads the directory, and does not trust the
    // loader. The file must therefore exist.
    await writeFile(path.join(rootDir, 'tina', 'config.ts'), 'export default {}');

    expect(await runCli(['codegen'], context)).toBe(0);
    expect(out.join('\n')).toMatch(/Wrote .*tina-lock\.json/);
    const lock = JSON.parse(
      await readFile(path.join(rootDir, 'tina', 'tina-lock.json'), 'utf8')
    );
    expect(lock.primitives).toEqual({ string: 1 });
  });

  it('resolves --root relative to the working directory', async () => {
    const { out, context } = capture();
    const nested = path.join(rootDir, 'site');
    await mkdir(path.join(nested, 'tina'), { recursive: true });
    await writeFile(path.join(nested, 'tina', 'config.ts'), 'export default {}');

    expect(await runCli(['codegen', '--root', 'site'], context)).toBe(0);
    expect(out.join('\n')).toContain(path.join(nested, 'tina', 'tina-lock.json'));
  });

  // Every throw on this path carries an explanation, so the developer reads that and
  // not a stack trace.
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

  // A call with no command is a mistake, and not a request for help. Print the usage,
  // and exit with a non-zero code.
  it('exits non-zero when given no command', async () => {
    const { out, context } = capture();
    expect(await runCli([], context)).toBe(1);
    expect(out.join('\n')).toContain('tinacms <command>');
  });
});

describe('runCli argument handling', () => {
  // parseArgs sat outside the try/catch, so a bad flag escaped as a stack trace —
  // against this file's own "a message, not a crash" contract.
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

  // A typo'd command used to exit 0 whenever --help was also passed.
  it('exits non-zero for an unknown command even with --help', async () => {
    const { err, context } = capture();
    expect(await runCli(['publish', '--help'], context)).toBe(1);
    expect(err.join('\n')).toMatch(/Unknown command "publish"/);
  });

  // startsWith('/') called C:\site relative and concatenated it onto cwd.
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
