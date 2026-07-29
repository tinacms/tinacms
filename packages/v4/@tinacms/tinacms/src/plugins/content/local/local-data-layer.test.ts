import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dispatchContentRequest } from './content-request';
import { createGraphQLPipeline } from './graphql-pipeline';
import { type LocalDataLayer, createLocalDataLayer } from './local-data-layer';

// The real pipeline boots the whole v3 stack. These tests cover the memoization around
// it.
vi.mock('./graphql-pipeline', () => ({ createGraphQLPipeline: vi.fn() }));

const HELLO_RAW = `---
title: Hello World
featured: false
category: not-in-schema
---

Body prose.
`;

let rootDir: string;
let dataLayer: LocalDataLayer;

beforeEach(async () => {
  rootDir = await fs.mkdtemp(path.join(tmpdir(), 'tina-local-'));
  await fs.mkdir(path.join(rootDir, 'content/posts/nested'), {
    recursive: true,
  });
  await fs.writeFile(path.join(rootDir, 'content/posts/hello.mdx'), HELLO_RAW);
  await fs.writeFile(
    path.join(rootDir, 'content/posts/nested/deep.mdx'),
    '---\ntitle: Deep\n---\n'
  );
  await fs.writeFile(path.join(rootDir, 'content/posts/ignored.txt'), 'nope');
  dataLayer = createLocalDataLayer({
    rootDir,
    collections: [
      {
        name: 'post',
        path: 'content/posts',
        format: 'mdx',
        fields: [{ name: 'body', type: 'rich-text', isBody: true }],
      },
      // This folder is never created.
      { name: 'page', path: 'content/pages', format: 'mdx', fields: [] },
    ],
  });
});

afterEach(() => fs.rm(rootDir, { recursive: true, force: true }));

describe('list', () => {
  it('returns matching files (recursively) with root-relative paths', async () => {
    const entries = await dataLayer.list('post');
    expect(entries.map((entry) => entry.path)).toEqual([
      'content/posts/hello.mdx',
      'content/posts/nested/deep.mdx',
    ]);
    expect(entries[0].document.title).toBe('Hello World');
  });

  it('returns [] when the collection folder does not exist yet', async () => {
    expect(await dataLayer.list('page')).toEqual([]);
  });

  it('skips (and warns on) an unparsable file instead of rejecting', async () => {
    await fs.writeFile(
      path.join(rootDir, 'content/posts/broken.mdx'),
      '---\ntitle: [unclosed\n---\n'
    );
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const entries = await dataLayer.list('post');
    expect(entries.map((entry) => entry.path)).toEqual([
      'content/posts/hello.mdx',
      'content/posts/nested/deep.mdx',
    ]);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it('skips (and warns on) an unreadable entry, e.g. a directory named *.mdx', async () => {
    await fs.mkdir(path.join(rootDir, 'content/posts/folder.mdx'));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const entries = await dataLayer.list('post');
    expect(entries.map((entry) => entry.path)).toEqual([
      'content/posts/hello.mdx',
      'content/posts/nested/deep.mdx',
    ]);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});

describe('get', () => {
  it('returns the parsed document', async () => {
    const entry = await dataLayer.get('post', 'content/posts/hello.mdx');
    expect(entry?.document).toMatchObject({ title: 'Hello World' });
  });

  it('returns null for a missing file', async () => {
    expect(await dataLayer.get('post', 'content/posts/gone.mdx')).toBeNull();
  });
});

describe('update', () => {
  it('writes the save, preserves unknown fields and the body, and returns the persisted entry', async () => {
    const saved = await dataLayer.update('post', 'content/posts/hello.mdx', {
      title: 'Renamed',
      featured: true,
    });
    const raw = await fs.readFile(
      path.join(rootDir, 'content/posts/hello.mdx'),
      'utf8'
    );
    expect(raw).toContain('category: not-in-schema');
    expect(raw).toContain('Body prose.');
    expect(saved).toEqual({
      path: 'content/posts/hello.mdx',
      document: {
        title: 'Renamed',
        featured: true,
        category: 'not-in-schema',
        body: 'Body prose.\n',
      },
    });
    const entry = await dataLayer.get('post', 'content/posts/hello.mdx');
    expect(entry?.document).toEqual(saved.document);
  });

  it('routes the isBody field to the markdown body, not the frontmatter', async () => {
    await dataLayer.update('post', 'content/posts/hello.mdx', {
      title: 'Renamed',
      body: 'Rewritten prose.\n',
    });
    const raw = await fs.readFile(
      path.join(rootDir, 'content/posts/hello.mdx'),
      'utf8'
    );
    expect(raw).not.toContain('body:');
    expect(raw).toContain('Rewritten prose.');
    const entry = await dataLayer.get('post', 'content/posts/hello.mdx');
    expect(entry?.document.body).toBe('Rewritten prose.\n');
  });

  it('leaves the body alone when the save omits the isBody field', async () => {
    await dataLayer.update('post', 'content/posts/hello.mdx', {
      title: 'Renamed',
    });
    const entry = await dataLayer.get('post', 'content/posts/hello.mdx');
    expect(entry?.document.body).toBe('Body prose.\n');
  });

  it('writes fresh when the file is missing (never lose the edit)', async () => {
    await dataLayer.update('post', 'content/posts/new.mdx', { title: 'New' });
    const entry = await dataLayer.get('post', 'content/posts/new.mdx');
    expect(entry?.document).toEqual({ title: 'New', body: '' });
  });

  it('recreates a parent folder deleted out-of-band (never lose the edit)', async () => {
    await fs.rm(path.join(rootDir, 'content/posts/nested'), {
      recursive: true,
    });
    await dataLayer.update('post', 'content/posts/nested/deep.mdx', {
      title: 'Restored',
    });
    const entry = await dataLayer.get('post', 'content/posts/nested/deep.mdx');
    expect(entry?.document).toEqual({ title: 'Restored', body: '' });
  });
});

describe('trust boundary', () => {
  it('rejects paths outside the collection folder', async () => {
    await expect(dataLayer.get('post', '../outside.mdx')).rejects.toThrow(
      /outside collection/
    );
    await expect(
      dataLayer.update('post', 'content/posts/../../escape.mdx', {})
    ).rejects.toThrow(/outside collection/);
  });

  it('rejects paths with the wrong extension', async () => {
    await expect(
      dataLayer.get('post', 'content/posts/ignored.txt')
    ).rejects.toThrow(/not a \.mdx file/);
  });

  it('canonicalizes a non-canonical path in the returned entry', async () => {
    const saved = await dataLayer.update(
      'post',
      'content/posts/nested/../hello.mdx',
      { title: 'Canonical' }
    );
    expect(saved.path).toBe('content/posts/hello.mdx');
  });

  it('rejects an unknown collection', async () => {
    await expect(dataLayer.list('nope')).rejects.toThrow(/Unknown collection/);
  });
});

describe('graphql pipeline', () => {
  it('retries the boot after a failure instead of caching the rejection', async () => {
    vi.mocked(createGraphQLPipeline)
      .mockRejectedValueOnce(new Error('boot failed'))
      .mockResolvedValueOnce({
        execute: async () => ({ data: {} }),
        reindexPaths: async () => {},
      });
    await expect(dataLayer.graphql('{}')).rejects.toThrow('boot failed');
    await expect(dataLayer.graphql('{}')).resolves.toEqual({ data: {} });
    expect(createGraphQLPipeline).toHaveBeenCalledTimes(2);
  });

  it('a reindex failure warns but does not fail the written save', async () => {
    vi.mocked(createGraphQLPipeline).mockResolvedValueOnce({
      execute: async () => ({ data: {} }),
      reindexPaths: async () => {
        throw new Error('index broke');
      },
    });
    await dataLayer.graphql('{}');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const saved = await dataLayer.update('post', 'content/posts/hello.mdx', {
      title: 'Still saved',
    });
    expect(saved.document.title).toBe('Still saved');
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});

// One collection with two formats. The extension of each document selects its adapter.
describe('mixed-format collection', () => {
  let mixed: LocalDataLayer;

  beforeEach(async () => {
    await fs.writeFile(
      path.join(rootDir, 'content/posts/settings.json'),
      '{\n  "title": "From JSON",\n  "extra": "kept"\n}\n'
    );
    mixed = createLocalDataLayer({
      rootDir,
      collections: [
        {
          name: 'post',
          path: 'content/posts',
          format: ['mdx', 'json'],
          fields: [{ name: 'body', type: 'rich-text', isBody: true }],
        },
      ],
    });
  });

  it('lists documents of every declared format', async () => {
    const entries = await mixed.list('post');
    expect(entries.map((entry) => entry.path)).toEqual([
      'content/posts/hello.mdx',
      'content/posts/nested/deep.mdx',
      'content/posts/settings.json',
    ]);
  });

  it('parses each document with the adapter its extension names', async () => {
    const markdown = await mixed.get('post', 'content/posts/hello.mdx');
    expect(markdown?.document).toMatchObject({
      title: 'Hello World',
      body: 'Body prose.\n',
    });
    const json = await mixed.get('post', 'content/posts/settings.json');
    expect(json?.document).toEqual({ title: 'From JSON', extra: 'kept' });
  });

  it('writes each document back in its own format', async () => {
    await mixed.update('post', 'content/posts/settings.json', {
      title: 'Renamed',
    });
    const raw = await fs.readFile(
      path.join(rootDir, 'content/posts/settings.json'),
      'utf8'
    );
    expect(JSON.parse(raw)).toEqual({ title: 'Renamed', extra: 'kept' });
    // The .mdx file beside it still passes through gray-matter with no change.
    await mixed.update('post', 'content/posts/hello.mdx', {
      body: 'Rewritten prose.\n',
    });
    const mdxRaw = await fs.readFile(
      path.join(rootDir, 'content/posts/hello.mdx'),
      'utf8'
    );
    expect(mdxRaw).toContain('title: Hello World');
    expect(mdxRaw).not.toContain('body:');
  });

  // JSON has no body, so the isBody field is stored with the other values. That is
  // correct for a document with no body.
  it('stores the body field inline for a format without a body', async () => {
    const saved = await mixed.update('post', 'content/posts/settings.json', {
      body: 'Not a markdown body.',
    });
    expect(saved.document.body).toBe('Not a markdown body.');
    const raw = await fs.readFile(
      path.join(rootDir, 'content/posts/settings.json'),
      'utf8'
    );
    expect(JSON.parse(raw).body).toBe('Not a markdown body.');
  });

  it('still rejects an extension no declared format claims', async () => {
    await expect(
      mixed.get('post', 'content/posts/ignored.txt')
    ).rejects.toThrow(/not a \.mdx or \.json file/);
  });

  it('rejects formats colliding on one extension at construction', () => {
    expect(() =>
      createLocalDataLayer({
        rootDir,
        collections: [
          {
            name: 'post',
            path: 'content/posts',
            format: ['mdx', 'mdx'],
            fields: [],
          },
        ],
      })
    ).toThrow(/duplicate extensions/);
  });
});

describe('dispatchContentRequest', () => {
  it('dispatches ops', async () => {
    const listed = await dispatchContentRequest(dataLayer, {
      op: 'list',
      collection: 'post',
    });
    expect(Array.isArray(listed)).toBe(true);
    const updated = await dispatchContentRequest(dataLayer, {
      op: 'update',
      collection: 'post',
      path: 'content/posts/hello.mdx',
      value: { title: 'Via wire' },
    });
    expect(updated).toMatchObject({
      path: 'content/posts/hello.mdx',
      document: { title: 'Via wire' },
    });
    const fetched = await dispatchContentRequest(dataLayer, {
      op: 'get',
      collection: 'post',
      path: 'content/posts/hello.mdx',
    });
    expect(fetched).toMatchObject({ document: { title: 'Via wire' } });
  });

  it('rejects a malformed request at the boundary', async () => {
    await expect(
      dispatchContentRequest(dataLayer, { op: 'drop-tables' })
    ).rejects.toThrow();
    await expect(
      dispatchContentRequest(dataLayer, { op: 'get', collection: 'post' })
    ).rejects.toThrow();
  });
});
