import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  type MockInstance,
  afterEach,
  beforeEach,
  expect,
  it,
  vi,
} from 'vitest';
import { runCodegen } from '../cli/commands/codegen';
import { openTinaConfig } from './load-config';

const closes: MockInstance[] = [];

vi.mock('vite', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vite')>();
  return {
    ...actual,
    createServer: async (...args: Parameters<typeof actual.createServer>) => {
      const server = await actual.createServer(...args);
      closes.push(vi.spyOn(server, 'close'));
      return server;
    },
  };
});

let rootDir: string;
let configPath: string;

beforeEach(async () => {
  closes.length = 0;
  rootDir = await mkdtemp(path.join(tmpdir(), 'tina-close-'));
  await mkdir(path.join(rootDir, 'tina'), { recursive: true });
  configPath = path.join(rootDir, 'tina', 'config.ts');
  await writeFile(
    configPath,
    'export default { plugins: [], schema: { collections: [] } };\n'
  );
});

afterEach(async () => {
  await rm(rootDir, { recursive: true, force: true });
});

it('closes its loader before runCodegen returns', async () => {
  await runCodegen({ rootDir, configPath, write: false });
  expect(closes).toHaveLength(1);
  expect(closes[0]).toHaveBeenCalledTimes(1);
});

it('keeps the loader open for reindex until the caller closes it', async () => {
  const opened = await openTinaConfig(configPath);
  expect(closes[0]).not.toHaveBeenCalled();
  await opened.loader.ssrLoadModule(configPath);
  await opened.close();
  expect(closes[0]).toHaveBeenCalledTimes(1);
});
