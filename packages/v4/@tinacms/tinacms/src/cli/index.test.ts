import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import type { ResolvedConfig } from '../config';
import { definePlugin } from '../core/plugin';
import { runCli } from './index';

let rootDir: string;

const resolved: ResolvedConfig = {
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
};

// Captures what a developer actually sees, and keeps it off the test runner's output.
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

beforeEach(async () => {
  rootDir = await mkdtemp(path.join(tmpdir(), 'tina-cli-'));
  await mkdir(path.join(rootDir, 'tina'), { recursive: true });
});

describe('runCli', () => {
  it('runs codegen against the working directory', async () => {
    const { out, context } = capture();
    // The config-file lookup reads the directory rather than trusting the loader,
    // so the file has to actually be there.
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

  // Every throw on this path carries a written explanation, so the developer gets
  // that rather than a stack trace.
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

  // A bare invocation is a mistake, not a request for help: usage, but non-zero.
  it('exits non-zero when given no command', async () => {
    const { out, context } = capture();
    expect(await runCli([], context)).toBe(1);
    expect(out.join('\n')).toContain('tinacms <command>');
  });
});
