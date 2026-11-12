import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nodesOf } from '../../../../core/content/contract';
import type {
  AllowedActions,
  CollectionSchema,
} from '../../../../core/schema/types';
import { t } from '../../../fields';
import { createGraphQLPipeline } from '../graphql/graphql-pipeline';
import { type LocalDataLayer, createLocalDataLayer } from './local-data-layer';

vi.mock('../graphql/graphql-pipeline', () => ({
  createGraphQLPipeline: vi.fn(),
}));

const isRoot = process.getuid?.() === 0;

const AUTHOR: CollectionSchema = {
  name: 'author',
  path: 'content/authors',
  format: 'md',
  fields: [{ type: 'string', name: 'name' }],
};

const postWith = (allowedActions?: AllowedActions): CollectionSchema => ({
  name: 'post',
  path: 'content/posts',
  format: 'md',
  allowedActions,
  fields: [
    t.string({ name: 'title' }),
    t.reference({ name: 'author', collections: ['author'] }),
    t.array({
      name: 'related',
      of: t.reference({ name: 'item', collections: ['post'] }),
    }),
    t.object({
      name: 'meta',
      fields: [t.reference({ name: 'editor', collections: ['author'] })],
    }),
  ],
});

let rootDir: string;

const write = async (relative: string, content = '---\n---\n') => {
  await fs.mkdir(path.dirname(path.join(rootDir, relative)), {
    recursive: true,
  });
  await fs.writeFile(path.join(rootDir, relative), content);
};
const read = (relative: string) =>
  fs.readFile(path.join(rootDir, relative), 'utf8');
const exists = async (relative: string) => {
  try {
    await fs.lstat(path.join(rootDir, relative));
    return true;
  } catch {
    return false;
  }
};
const layerWith = (allowedActions?: AllowedActions) =>
  createLocalDataLayer({
    rootDir,
    collections: [postWith(allowedActions), AUTHOR],
  });

const ADA = '---\nname: Ada\n---\n';
const REFERRER = `---
title: Refers
author: content/authors/ada.md
related:
  - content/posts/refers.md
  - content/authors/other.md
meta:
  editor: content/authors/ada.md
---
`;

beforeEach(async () => {
  rootDir = await fs.mkdtemp(path.join(tmpdir(), 'tina-structure-'));
  vi.mocked(createGraphQLPipeline).mockReset();
});

afterEach(async () => {
  vi.restoreAllMocks();
  await fs.rm(rootDir, { recursive: true, force: true });
});

describe('create', () => {
  it('writes a new document and refuses a path that exists, leaving it unchanged', async () => {
    const layer = layerWith();
    const entry = await layer.create('post', 'content/posts/new.md', {
      title: 'New',
    });
    expect(entry.path).toBe('content/posts/new.md');
    expect(await read('content/posts/new.md')).toContain('title: New');
    await expect(
      layer.create('post', 'content/posts/new.md', { title: 'Other' })
    ).rejects.toMatchObject({ code: 'name-taken' });
    expect(await read('content/posts/new.md')).toContain('title: New');
  });

  it('makes a missing parent folder', async () => {
    await layerWith().create('post', 'content/posts/a/b/new.md', {});
    expect(await exists('content/posts/a/b/new.md')).toBe(true);
  });

  it('refuses a name the rules refuse, and a path outside the collection', async () => {
    const layer = layerWith();
    for (const name of ['.gitkeep.md', '.hidden.md', 'trailing .md', ' .md']) {
      await expect(
        layer.create('post', `content/posts/${name}`, {})
      ).rejects.toMatchObject({ code: 'invalid-path' });
    }
    await expect(
      layer.create('post', 'content/posts/../escape.md', {})
    ).rejects.toMatchObject({ code: 'invalid-path' });
    expect(await exists('content/escape.md')).toBe(false);
  });
});

describe('rename', () => {
  beforeEach(async () => {
    await write('content/authors/ada.md', ADA);
    await write('content/posts/refers.md', REFERRER);
    await write('content/posts/other.md', '---\ntitle: Other\n---\n');
  });

  it('moves the file and rewrites every reference, nested ones and a self-reference included', async () => {
    const result = await layerWith().rename(
      'author',
      'content/authors/ada.md',
      'content/authors/ada-l.md'
    );
    expect(result.entry.path).toBe('content/authors/ada-l.md');
    expect(result.referrers).toEqual(['content/posts/refers.md']);
    expect(await exists('content/authors/ada.md')).toBe(false);
    expect(await read('content/posts/refers.md')).toContain(
      'author: content/authors/ada-l.md'
    );
    expect(await read('content/posts/refers.md')).toContain(
      '  editor: content/authors/ada-l.md'
    );
    expect(await read('content/posts/refers.md')).toContain(
      '  - content/authors/other.md'
    );
  });

  it('writes each rewritten referrer exactly as a save of only that change writes it', async () => {
    const layer = layerWith();
    await write('content/posts/twin.md', REFERRER);
    const twin = await layer.get('post', 'content/posts/twin.md');
    const document = JSON.parse(
      JSON.stringify(twin?.document).replaceAll(
        'authors/ada.md',
        'authors/ada-l.md'
      )
    );
    await layer.update('post', 'content/posts/twin.md', document);
    await write('content/posts/twin2.md', REFERRER);
    await fs.rename(
      path.join(rootDir, 'content/posts/twin2.md'),
      path.join(rootDir, 'content/posts/refers.md')
    );
    await layer.rename(
      'author',
      'content/authors/ada.md',
      'content/authors/ada-l.md'
    );
    expect(await read('content/posts/refers.md')).toBe(
      await read('content/posts/twin.md')
    );
  });

  it('rewrites a document that refers to itself at its new path', async () => {
    const layer = layerWith();
    const result = await layer.rename(
      'post',
      'content/posts/refers.md',
      'content/posts/renamed.md'
    );
    expect(result.referrers).toEqual(['content/posts/renamed.md']);
    expect(await read('content/posts/renamed.md')).toContain(
      '  - content/posts/renamed.md'
    );
  });

  it('refuses a taken target and every name the rules refuse, changing nothing', async () => {
    const layer = layerWith();
    await expect(
      layer.rename('post', 'content/posts/other.md', 'content/posts/refers.md')
    ).rejects.toMatchObject({ code: 'name-taken' });
    const refused = [
      'content/posts/.md',
      'content/posts/   .md',
      'content/posts/..md',
      'content/posts/.hidden.md',
      'content/posts/a\\b.md',
      'content/posts/a\0b.md',
      'content/posts/space .md',
      'content/posts/dot..md',
      `content/posts/${'x'.repeat(260)}.md`,
      'content/posts/.gitkeep.md',
      'content/posts/other.mdx',
      'content/posts/sub/other.md',
      'content/elsewhere/other.md',
    ];
    for (const to of refused) {
      await expect(
        layer.rename('post', 'content/posts/other.md', to)
      ).rejects.toMatchObject({ code: 'invalid-path' });
    }
    expect(await read('content/posts/other.md')).toContain('title: Other');
    expect(await fs.readdir(path.join(rootDir, 'content/posts'))).toEqual([
      'other.md',
      'refers.md',
    ]);
  });

  it('answers not-found for a missing source', async () => {
    await expect(
      layerWith().rename('post', 'content/posts/none.md', 'content/posts/x.md')
    ).rejects.toMatchObject({ code: 'not-found' });
  });

  it('renames a file by letter case only', async () => {
    await layerWith().rename(
      'post',
      'content/posts/other.md',
      'content/posts/Other.md'
    );
    expect(await fs.readdir(path.join(rootDir, 'content/posts'))).toContain(
      'Other.md'
    );
  });

  it('refuses to rename a document of one collection under the name of another', async () => {
    await expect(
      layerWith().rename(
        'post',
        'content/authors/ada.md',
        'content/authors/ada2.md'
      )
    ).rejects.toMatchObject({ code: 'invalid-path' });
    expect(await exists('content/authors/ada.md')).toBe(true);
  });

  it.skipIf(isRoot)(
    'puts every file back when a referrer write fails',
    async () => {
      const referrer = path.join(rootDir, 'content/posts/refers.md');
      await fs.chmod(referrer, 0o444);
      await expect(
        layerWith().rename(
          'author',
          'content/authors/ada.md',
          'content/authors/ada-l.md'
        )
      ).rejects.toThrow(/Nothing was changed/);
      await fs.chmod(referrer, 0o644);
      expect(await exists('content/authors/ada.md')).toBe(true);
      expect(await exists('content/authors/ada-l.md')).toBe(false);
      expect(await read('content/posts/refers.md')).toBe(REFERRER);
    }
  );

  it('keeps a save that started during a rename, and runs it after the rename', async () => {
    const layer = layerWith();
    const rename = layer.rename(
      'author',
      'content/authors/ada.md',
      'content/authors/ada-l.md'
    );
    const saved = layer.update(
      'post',
      'content/posts/other.md',
      { title: 'Saved during rename' },
      { mayCreate: false }
    );
    await Promise.all([rename, saved]);
    expect(await read('content/posts/other.md')).toContain(
      'Saved during rename'
    );
  });
});

describe('delete and referrers', () => {
  beforeEach(async () => {
    await write('content/authors/ada.md', ADA);
    await write('content/posts/refers.md', REFERRER);
  });

  it('lists the referrers of a document, never the document itself', async () => {
    const layer = layerWith();
    expect(await layer.referrers('author', 'content/authors/ada.md')).toEqual([
      { collection: 'post', path: 'content/posts/refers.md', title: 'Refers' },
    ]);
    expect(await layer.referrers('post', 'content/posts/refers.md')).toEqual(
      []
    );
  });

  it('deletes the file and leaves the referrers as they are', async () => {
    const layer = layerWith();
    await layer.delete('author', 'content/authors/ada.md');
    expect(await exists('content/authors/ada.md')).toBe(false);
    expect(await read('content/posts/refers.md')).toBe(REFERRER);
    await expect(
      layer.delete('author', 'content/authors/ada.md')
    ).rejects.toMatchObject({ code: 'not-found' });
  });

  it('refuses a delete of a document under another collection name', async () => {
    await expect(
      layerWith().delete('post', 'content/authors/ada.md')
    ).rejects.toMatchObject({ code: 'invalid-path' });
    expect(await exists('content/authors/ada.md')).toBe(true);
  });
});

describe('folders', () => {
  beforeEach(async () => {
    await write('content/authors/ada.md', ADA);
    await write(
      'content/posts/refers.md',
      REFERRER.replaceAll('authors/ada.md', 'authors/ada.md')
    );
    await write('content/posts/series/one.md', '---\ntitle: One\n---\n');
    await write('content/posts/series/two.md', '---\ntitle: Two\n---\n');
    await write('content/authors/fan.md', '---\nname: Fan\n---\n');
  });

  it('creates a folder with a placeholder that lists with 0 documents', async () => {
    const layer = layerWith();
    expect(await layer.createFolder('post', 'drafts')).toEqual({
      path: 'drafts',
      name: 'drafts',
      documentCount: 0,
    });
    expect(await exists('content/posts/drafts/.gitkeep.md')).toBe(true);
    const listed = await layer.list('post', { folder: '' });
    expect(listed.folders).toContainEqual({
      path: 'drafts',
      name: 'drafts',
      documentCount: 0,
    });
    expect(nodesOf(await layer.list('post'))).toHaveLength(3);
    await expect(layer.createFolder('post', 'drafts')).rejects.toMatchObject({
      code: 'name-taken',
    });
    await expect(layer.createFolder('post', '.hidden')).rejects.toMatchObject({
      code: 'invalid-path',
    });
  });

  it('renames a folder, rewrites references to the documents inside, and reports what moved', async () => {
    await write(
      'content/authors/fan.md',
      '---\nname: Fan\nfavourite: x\n---\n'
    );
    const refersToSeries = `---\ntitle: R\nrelated:\n  - content/posts/series/one.md\n---\n`;
    await write('content/posts/refers.md', refersToSeries);
    const result = await layerWith().renameFolder('post', 'series', 'saga');
    expect(result.moved).toEqual([
      { from: 'content/posts/series/one.md', to: 'content/posts/saga/one.md' },
      { from: 'content/posts/series/two.md', to: 'content/posts/saga/two.md' },
    ]);
    expect(result.folder).toEqual({
      path: 'saga',
      name: 'saga',
      documentCount: 2,
    });
    expect(result.referrers).toEqual(['content/posts/refers.md']);
    expect(await read('content/posts/refers.md')).toContain(
      'content/posts/saga/one.md'
    );
    expect(await exists('content/posts/series')).toBe(false);
  });

  it('refuses a folder rename to another parent or a taken name', async () => {
    const layer = layerWith();
    await layer.createFolder('post', 'other');
    await expect(
      layer.renameFolder('post', 'series', 'other')
    ).rejects.toMatchObject({ code: 'name-taken' });
    await expect(
      layer.renameFolder('post', 'series', 'other/series')
    ).rejects.toMatchObject({ code: 'invalid-path' });
    await expect(
      layer.renameFolder('post', 'series', '.hidden')
    ).rejects.toMatchObject({ code: 'invalid-path' });
    expect(await exists('content/posts/series/one.md')).toBe(true);
  });

  it('deletes a folder with its documents and returns their paths', async () => {
    const result = await layerWith().deleteFolder('post', 'series');
    expect(result.deleted).toEqual([
      'content/posts/series/one.md',
      'content/posts/series/two.md',
    ]);
    expect(await exists('content/posts/series')).toBe(false);
    expect(
      (await fs.readdir(path.join(rootDir, 'content/posts'))).sort()
    ).toEqual(['refers.md']);
  });

  it.skipIf(isRoot)(
    'leaves every file when a folder delete fails',
    async () => {
      const posts = path.join(rootDir, 'content/posts');
      await fs.chmod(posts, 0o555);
      try {
        await expect(
          layerWith().deleteFolder('post', 'series')
        ).rejects.toThrow();
      } finally {
        await fs.chmod(posts, 0o755);
      }
      expect(await exists('content/posts/series/one.md')).toBe(true);
      expect(await exists('content/posts/series/two.md')).toBe(true);
    }
  );

  it('ignores system files and refuses folders that hold foreign files', async () => {
    const layer = layerWith();
    await write('content/posts/series/.DS_Store', 'x');
    await write('content/posts/mixed/a.md');
    await write('content/posts/mixed/photo.png', 'png');
    await expect(
      layer.renameFolder('post', 'mixed', 'moved')
    ).rejects.toMatchObject({
      code: 'folder-not-owned',
    });
    await expect(layer.deleteFolder('post', 'mixed')).rejects.toMatchObject({
      code: 'folder-not-owned',
    });
    expect(await exists('content/posts/mixed/photo.png')).toBe(true);
    await layer.deleteFolder('post', 'series');
    expect(await exists('content/posts/series')).toBe(false);
  });

  it('refuses a folder that holds another format collection sharing the folder', async () => {
    const shared = createLocalDataLayer({
      rootDir,
      collections: [
        postWith(),
        { name: 'config', path: 'content/posts', format: 'json', fields: [] },
      ],
    });
    await write('content/posts/mixed/a.md');
    await write('content/posts/mixed/b.json', '{}');
    await expect(shared.deleteFolder('post', 'mixed')).rejects.toMatchObject({
      code: 'folder-not-owned',
    });
    expect(await exists('content/posts/mixed/b.json')).toBe(true);
  });

  it('refuses a folder with another collection root at or below it', async () => {
    const site: CollectionSchema = {
      name: 'site',
      path: 'content',
      format: 'md',
      fields: [],
    };
    const deep: CollectionSchema = {
      name: 'deep',
      path: 'content/blog/posts',
      format: 'md',
      fields: [],
    };
    const layer = createLocalDataLayer({ rootDir, collections: [site, deep] });
    await write('content/blog/note.md');
    await write('content/blog/posts/a.md');
    await expect(
      layer.renameFolder('site', 'blog', 'news')
    ).rejects.toMatchObject({
      code: 'folder-not-owned',
    });
    await expect(layer.deleteFolder('site', 'blog')).rejects.toMatchObject({
      code: 'folder-not-owned',
    });
    await expect(
      layer.deleteFolder('site', 'blog/posts')
    ).rejects.toMatchObject({
      code: 'folder-not-owned',
    });
    expect(await exists('content/blog/posts/a.md')).toBe(true);
  });

  it('refuses a folder that is a symlink out of the collection', async () => {
    await fs.mkdir(path.join(rootDir, 'outside'));
    await write('outside/x.md');
    await fs.symlink(
      path.join(rootDir, 'outside'),
      path.join(rootDir, 'content/posts/escape')
    );
    await expect(
      layerWith().deleteFolder('post', 'escape')
    ).rejects.toMatchObject({
      code: 'invalid-path',
    });
    expect(await exists('outside/x.md')).toBe(true);
  });
});

describe('allowedActions', () => {
  beforeEach(async () => {
    await write('content/posts/a.md');
    await write('content/posts/series/b.md');
  });

  it('refuses delete and deleteFolder with forbidden when canDelete is false', async () => {
    const layer = layerWith({ canDelete: false });
    await expect(
      layer.delete('post', 'content/posts/a.md')
    ).rejects.toMatchObject({
      code: 'forbidden',
    });
    await expect(layer.deleteFolder('post', 'series')).rejects.toMatchObject({
      code: 'forbidden',
    });
    expect(await exists('content/posts/series/b.md')).toBe(true);
  });

  it('refuses create only when both canCreate and canDuplicate are false', async () => {
    await expect(
      layerWith({ canCreate: false, canDuplicate: false }).create(
        'post',
        'content/posts/n.md',
        {}
      )
    ).rejects.toMatchObject({ code: 'forbidden' });
    await layerWith({ canCreate: false }).create(
      'post',
      'content/posts/n.md',
      {}
    );
    expect(await exists('content/posts/n.md')).toBe(true);
  });

  it('refuses createFolder when canCreateFolder is false, and a nested one when canCreateNestedFolder is false', async () => {
    await expect(
      layerWith({ canCreateFolder: false }).createFolder('post', 'top')
    ).rejects.toMatchObject({ code: 'forbidden' });
    const layer = layerWith({ canCreateNestedFolder: false });
    await layer.createFolder('post', 'top');
    await expect(
      layer.createFolder('post', 'series/inner')
    ).rejects.toMatchObject({
      code: 'forbidden',
    });
    expect(await exists('content/posts/series/inner')).toBe(false);
  });

  it('checks an update to a missing path as a create', async () => {
    const layer = layerWith({ canCreateFolder: false });
    await expect(
      layer.update('post', 'content/posts/new.md', {}, { mayCreate: false })
    ).rejects.toMatchObject({ code: 'forbidden' });
    await layer.update('post', 'content/posts/new.md', {}, { mayCreate: true });
    await expect(
      layer.update(
        'post',
        'content/posts/fresh/new.md',
        {},
        { mayCreate: true }
      )
    ).rejects.toMatchObject({ code: 'forbidden' });
    expect(await exists('content/posts/fresh')).toBe(false);
    await expect(
      layerWith({ canCreate: false, canDuplicate: false }).update(
        'post',
        'content/posts/other-new.md',
        {},
        { mayCreate: true }
      )
    ).rejects.toMatchObject({ code: 'forbidden' });
    await expect(
      layerWith().update(
        'post',
        'content/posts/.gitkeep.md',
        {},
        { mayCreate: true }
      )
    ).rejects.toMatchObject({ code: 'invalid-path' });
    await expect(
      layerWith({ canCreateNestedFolder: false }).update(
        'post',
        'content/posts/series/deeper/x.md',
        {},
        { mayCreate: true }
      )
    ).rejects.toMatchObject({ code: 'forbidden' });
  });

  it('still saves an existing file whose name the rules refuse', async () => {
    await write('content/posts/.odd.md', '---\ntitle: Odd\n---\n');
    const saved = await layerWith({
      canCreate: false,
      canDuplicate: false,
    }).update('post', 'content/posts/.odd.md', { title: 'Still saves' });
    expect(saved.document.title).toBe('Still saves');
  });
});

describe('GraphQL index', () => {
  it('removes deleted paths and reindexes added and changed ones, never a placeholder', async () => {
    const pipeline = {
      execute: vi.fn(async () => ({ data: {} })),
      reindexPaths: vi.fn(async () => {}),
      removePaths: vi.fn(async () => {}),
      close: vi.fn(async () => {}),
    };
    vi.mocked(createGraphQLPipeline).mockResolvedValue(pipeline);
    await write('content/authors/ada.md', ADA);
    await write('content/posts/refers.md', REFERRER);
    await write('content/posts/series/one.md');
    const layer = layerWith();
    await layer.graphql('{}');

    await layer.createFolder('post', 'drafts');
    expect(pipeline.reindexPaths).not.toHaveBeenCalled();

    await layer.rename(
      'author',
      'content/authors/ada.md',
      'content/authors/ada-l.md'
    );
    expect(pipeline.removePaths).toHaveBeenLastCalledWith([
      'content/authors/ada.md',
    ]);
    expect(pipeline.reindexPaths).toHaveBeenLastCalledWith([
      'content/authors/ada-l.md',
      'content/posts/refers.md',
    ]);

    await layer.deleteFolder('post', 'series');
    expect(pipeline.removePaths).toHaveBeenLastCalledWith([
      'content/posts/series/one.md',
    ]);
  });
});
