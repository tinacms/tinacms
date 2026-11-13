import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nodesOf } from '../../../../core/content/contract';
import type { CollectionSchema } from '../../../../core/schema/types';
import { type LocalDataLayer, createLocalDataLayer } from './local-data-layer';

vi.mock('../graphql/graphql-pipeline', () => ({
  createGraphQLPipeline: vi.fn(),
}));

const POST: CollectionSchema = {
  name: 'post',
  path: 'content/posts',
  format: 'md',
  fields: [{ type: 'string', name: 'title' }],
};

let rootDir: string;
let layer: LocalDataLayer;

const write = async (relative: string, content = '---\n---\n') => {
  await fs.mkdir(path.dirname(path.join(rootDir, relative)), {
    recursive: true,
  });
  await fs.writeFile(path.join(rootDir, relative), content);
};

const layerOf = (...collections: CollectionSchema[]) =>
  createLocalDataLayer({ rootDir, collections });

beforeEach(async () => {
  rootDir = await fs.mkdtemp(path.join(tmpdir(), 'tina-list-'));
  layer = layerOf(POST);
});

afterEach(() => fs.rm(rootDir, { recursive: true, force: true }));

const pathsOf = (connection: Awaited<ReturnType<LocalDataLayer['list']>>) =>
  nodesOf(connection).map(({ path: p }) => p);

describe('list scope', () => {
  beforeEach(async () => {
    await write('content/posts/top.md', '---\ntitle: Top\n---\n');
    await write('content/posts/a/one.md');
    await write('content/posts/a/b/two.md');
    await write('content/posts/a/b/.gitkeep.md', '');
    await write('content/posts/empty/.gitkeep.md', '');
  });

  it('lists every document at every depth with no folders when `folder` is omitted', async () => {
    const connection = await layer.list('post');
    expect(pathsOf(connection)).toEqual([
      'content/posts/a/b/two.md',
      'content/posts/a/one.md',
      'content/posts/top.md',
    ]);
    expect(connection.folders).toEqual([]);
    expect(connection.totalCount).toBe(3);
  });

  it('lists one level and counts the documents under each folder at every depth', async () => {
    const connection = await layer.list('post', { folder: '' });
    expect(pathsOf(connection)).toEqual(['content/posts/top.md']);
    expect(connection.folders).toEqual([
      { path: 'a', name: 'a', documentCount: 2 },
      { path: 'empty', name: 'empty', documentCount: 0 },
    ]);
    const inner = await layer.list('post', { folder: 'a' });
    expect(pathsOf(inner)).toEqual(['content/posts/a/one.md']);
    expect(inner.folders).toEqual([
      { path: 'a/b', name: 'b', documentCount: 1 },
    ]);
  });

  it('keeps a filter inside the folder it names', async () => {
    const connection = await layer.list('post', { folder: 'a', filter: 'two' });
    expect(connection.totalCount).toBe(0);
    expect(connection.folders).toEqual([]);
  });

  it('refuses a folder that does not exist with not-found', async () => {
    await expect(layer.list('post', { folder: 'nope' })).rejects.toMatchObject({
      code: 'not-found',
    });
  });

  it('shows a missing collection folder as empty at the top and not found below', async () => {
    const other = layerOf({ ...POST, name: 'ghost', path: 'content/ghost' });
    expect(await other.list('ghost', { folder: '' })).toMatchObject({
      totalCount: 0,
      folders: [],
    });
    await expect(other.list('ghost', { folder: 'x' })).rejects.toMatchObject({
      code: 'not-found',
    });
  });
});

describe('list paging, filter and sort', () => {
  it('pages 120 documents as 50, 50 and 20 with a stable total', async () => {
    for (let index = 0; index < 120; index += 1) {
      await write(`content/posts/p${String(index).padStart(3, '0')}.md`);
    }
    const sort = { by: 'title', direction: 'asc' } as const;
    const first = await layer.list('post', { sort, first: 50 });
    const second = await layer.list('post', {
      sort,
      first: 50,
      after: first.pageInfo.endCursor ?? undefined,
    });
    const third = await layer.list('post', {
      sort,
      first: 50,
      after: second.pageInfo.endCursor ?? undefined,
    });
    expect([first, second, third].map((page) => page.edges.length)).toEqual([
      50, 50, 20,
    ]);
    expect(third.pageInfo.hasNextPage).toBe(false);
    expect(first.pageInfo.hasNextPage).toBe(true);
    expect([first, second, third].map((page) => page.totalCount)).toEqual([
      120, 120, 120,
    ]);
  });

  it('does not skip or repeat a row when the last row of page 1 is deleted between reads', async () => {
    for (let index = 0; index < 6; index += 1)
      await write(`content/posts/p${index}.md`);
    const sort = { by: 'title', direction: 'asc' } as const;
    const first = await layer.list('post', { sort, first: 3 });
    await layer.delete('post', 'content/posts/p2.md');
    const second = await layer.list('post', {
      sort,
      first: 3,
      after: first.pageInfo.endCursor ?? undefined,
    });
    expect(pathsOf(second)).toEqual([
      'content/posts/p3.md',
      'content/posts/p4.md',
      'content/posts/p5.md',
    ]);
  });

  it('refuses a cursor that does not decode and a page size above 200 with validation', async () => {
    await write('content/posts/a.md');
    await expect(layer.list('post', { after: '%%%' })).rejects.toMatchObject({
      code: 'validation',
    });
    await expect(layer.list('post', { first: 201 })).rejects.toMatchObject({
      code: 'validation',
    });
  });

  it('matches the title or file name after NFKC and lower-casing, with no pattern characters', async () => {
    await write('content/posts/a.b.md', '---\ntitle: Plain\n---\n');
    await write('content/posts/axb.md', '---\ntitle: Other\n---\n');
    await write('content/posts/paren.md', '---\ntitle: (Open\n---\n');
    await write('content/posts/cafe.md', '---\ntitle: Café\n---\n');
    expect(pathsOf(await layer.list('post', { filter: 'a.b' }))).toEqual([
      'content/posts/a.b.md',
    ]);
    expect(pathsOf(await layer.list('post', { filter: '(' }))).toEqual([
      'content/posts/paren.md',
    ]);
    expect(pathsOf(await layer.list('post', { filter: 'CAFÉ' }))).toEqual([
      'content/posts/cafe.md',
    ]);
    const matched = await layer.list('post', { filter: 'plain' });
    expect(matched.totalCount).toBe(1);
    expect(pathsOf(await layer.list('post', { filter: '' }))).toHaveLength(4);
  });

  it('sorts by updatedAt with undated documents last, and by title in both directions', async () => {
    await write('content/posts/old.md', '---\ntitle: Bravo\n---\n');
    await write('content/posts/new.md', '---\ntitle: Alpha\n---\n');
    await fs.utimes(
      path.join(rootDir, 'content/posts/old.md'),
      new Date('2020-01-01'),
      new Date('2020-01-01')
    );
    await fs.symlink(
      path.join(rootDir, 'content/posts/missing-target.md'),
      path.join(rootDir, 'content/posts/dangling.md')
    );
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const byDate = await layer.list('post', {
      sort: { by: 'updatedAt', direction: 'desc' },
    });
    expect(pathsOf(byDate)).toEqual([
      'content/posts/new.md',
      'content/posts/old.md',
      'content/posts/dangling.md',
    ]);
    const byTitleDesc = await layer.list('post', {
      sort: { by: 'title', direction: 'desc' },
    });
    expect(pathsOf(byTitleDesc)).toEqual([
      'content/posts/dangling.md',
      'content/posts/old.md',
      'content/posts/new.md',
    ]);
    const byTitleAsc = await layer.list('post', {
      sort: { by: 'title', direction: 'asc' },
    });
    expect(pathsOf(byTitleAsc)).toEqual([
      'content/posts/new.md',
      'content/posts/old.md',
      'content/posts/dangling.md',
    ]);
  });
});

describe('list path checks and ownership', () => {
  it('refuses a folder outside the collection and reads nothing from it', async () => {
    await expect(layer.list('post', { folder: '../..' })).rejects.toMatchObject(
      {
        code: 'invalid-path',
      }
    );
    await expect(layer.list('post', { folder: '/etc' })).rejects.toMatchObject({
      code: 'invalid-path',
    });
    await fs.mkdir(path.join(rootDir, 'outside'));
    await write('content/posts/seed.md');
    await fs.symlink(
      path.join(rootDir, 'outside'),
      path.join(rootDir, 'content/posts/escape')
    );
    await expect(
      layer.list('post', { folder: 'escape' })
    ).rejects.toMatchObject({
      code: 'invalid-path',
    });
  });

  it('refuses a referrers call for a path outside the collection', async () => {
    await expect(
      layer.referrers('post', '../outside.md')
    ).rejects.toMatchObject({ code: 'invalid-path' });
  });

  it('does not list a folder that is another collection, and refuses it', async () => {
    const site: CollectionSchema = { ...POST, name: 'site', path: 'content' };
    const nested = layerOf(site, POST);
    await write('content/home.md');
    await write('content/posts/a.md');
    const connection = await nested.list('site', { folder: '' });
    expect(connection.folders).toEqual([]);
    await expect(
      nested.list('site', { folder: 'posts' })
    ).rejects.toMatchObject({ code: 'folder-not-owned' });
  });

  it('lists a folder above another collection root and its own documents, but not the nested root', async () => {
    const site: CollectionSchema = { ...POST, name: 'site', path: 'content' };
    const deep: CollectionSchema = {
      ...POST,
      name: 'deep',
      path: 'content/blog/posts',
    };
    const nested = layerOf(site, deep);
    await write('content/blog/note.md');
    await write('content/blog/posts/a.md');
    const top = await nested.list('site', { folder: '' });
    expect(top.folders.map(({ name }) => name)).toEqual(['blog']);
    const blog = await nested.list('site', { folder: 'blog' });
    expect(pathsOf(blog)).toEqual(['content/blog/note.md']);
    expect(blog.folders).toEqual([]);
  });
});
