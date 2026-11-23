import { promises as fs } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { parseTinaLock } from '@tinacms/v4-content/lock';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLocalDataLayer, type LocalDataLayer } from './local-data-layer';

vi.mock('../graphql/graphql-pipeline', () => ({
  createGraphQLPipeline: vi.fn(),
}));

// The golden fixtures live in @tinacms/v4-content, next to its dist folder.
const FIXTURE = path.resolve(
  path.dirname(
    createRequire(import.meta.url).resolve('@tinacms/v4-content/lock')
  ),
  '../fixtures/kitchen-sink'
);

let rootDir: string;
let layer: LocalDataLayer;

beforeEach(async () => {
  rootDir = await fs.mkdtemp(path.join(tmpdir(), 'tina-golden-'));
  await fs.cp(FIXTURE, rootDir, { recursive: true });
  const lock = parseTinaLock(
    await fs.readFile(path.join(rootDir, 'tina-lock.json'), 'utf8')
  );
  layer = createLocalDataLayer({
    rootDir,
    collections: lock.schema.collections,
  });
});

afterEach(() => fs.rm(rootDir, { recursive: true, force: true }));

describe('golden fixture kitchen-sink: a save that changes nothing', () => {
  it.each([
    ['author', 'content/authors/ada.json'],
    ['post', 'content/posts/hello.mdx'],
  ])('leaves the bytes of %s %s unchanged', async (collection, file) => {
    const absolute = path.join(rootDir, file);
    const before = await fs.readFile(absolute, 'utf8');
    const { document } = await layer.get(collection, file);
    await layer.update(collection, file, document);
    expect(await fs.readFile(absolute, 'utf8')).toBe(before);
  });
});
