import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { INIT_FILES, runInit } from './init';

let rootDir: string;

beforeEach(async () => {
  rootDir = await mkdtemp(path.join(tmpdir(), 'tina-init-'));
});

afterEach(async () => {
  await rm(rootDir, { recursive: true, force: true });
});

describe('runInit', () => {
  it('writes every starter file into an empty directory', async () => {
    const result = await runInit({ rootDir });

    expect(result.files).toHaveLength(INIT_FILES.length);
    for (const file of result.files) {
      expect(file.outcome).toBe('created');
    }
    const config = await readFile(
      path.join(rootDir, 'tina', 'config.ts'),
      'utf8'
    );
    expect(config).toContain('export default defineConfig(');
    expect(config).toContain('localContentPlugin()');
    const document = await readFile(
      path.join(rootDir, 'content', 'posts', 'hello-world.mdx'),
      'utf8'
    );
    expect(document).toContain('title: Hello World');
  });

  it('keeps a file that exists, byte for byte', async () => {
    const configPath = path.join(rootDir, 'tina', 'config.ts');
    await runInit({ rootDir });
    const edited = '// The project edited this file.\n';
    await writeFile(configPath, edited);

    const result = await runInit({ rootDir });

    const config = result.files.find((file) => file.path === configPath);
    expect(config?.outcome).toBe('kept');
    expect(await readFile(configPath, 'utf8')).toBe(edited);
    for (const file of result.files) {
      expect(file.outcome).toBe('kept');
    }
  });

  it('reports every path under the root it was given', async () => {
    const result = await runInit({ rootDir });
    for (const file of result.files) {
      expect(file.path.startsWith(rootDir)).toBe(true);
    }
  });
});
