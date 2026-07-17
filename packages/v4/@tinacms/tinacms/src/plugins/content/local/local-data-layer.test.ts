import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ContentProvider } from '../../../core/content/contract';
import { createLocalDataLayer, handleContentRequest } from './local-data-layer';

const HELLO_RAW = `---
title: Hello World
featured: false
category: not-in-schema
---

Body prose.
`;

let rootDir: string;
let dataLayer: ContentProvider;

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
      { name: 'post', path: 'content/posts', format: 'mdx', fields: [] },
      // Folder intentionally never created.
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
      },
    });
    const entry = await dataLayer.get('post', 'content/posts/hello.mdx');
    expect(entry?.document).toEqual(saved.document);
  });

  it('writes fresh when the file is missing (never lose the edit)', async () => {
    await dataLayer.update('post', 'content/posts/new.mdx', { title: 'New' });
    const entry = await dataLayer.get('post', 'content/posts/new.mdx');
    expect(entry?.document).toEqual({ title: 'New' });
  });

  it('recreates a parent folder deleted out-of-band (never lose the edit)', async () => {
    await fs.rm(path.join(rootDir, 'content/posts/nested'), {
      recursive: true,
    });
    await dataLayer.update('post', 'content/posts/nested/deep.mdx', {
      title: 'Restored',
    });
    const entry = await dataLayer.get('post', 'content/posts/nested/deep.mdx');
    expect(entry?.document).toEqual({ title: 'Restored' });
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
    ).rejects.toThrow(/outside collection/);
  });

  it('rejects an unknown collection', async () => {
    await expect(dataLayer.list('nope')).rejects.toThrow(/Unknown collection/);
  });
});

describe('handleContentRequest', () => {
  it('dispatches ops', async () => {
    const listed = await handleContentRequest(dataLayer, {
      op: 'list',
      collection: 'post',
    });
    expect(Array.isArray(listed)).toBe(true);
    const updated = await handleContentRequest(dataLayer, {
      op: 'update',
      collection: 'post',
      path: 'content/posts/hello.mdx',
      value: { title: 'Via wire' },
    });
    expect(updated).toMatchObject({
      path: 'content/posts/hello.mdx',
      document: { title: 'Via wire' },
    });
    const fetched = await handleContentRequest(dataLayer, {
      op: 'get',
      collection: 'post',
      path: 'content/posts/hello.mdx',
    });
    expect(fetched).toMatchObject({ document: { title: 'Via wire' } });
  });

  it('rejects a malformed request at the boundary', async () => {
    await expect(
      handleContentRequest(dataLayer, { op: 'drop-tables' })
    ).rejects.toThrow();
    await expect(
      handleContentRequest(dataLayer, { op: 'get', collection: 'post' })
    ).rejects.toThrow();
  });
});
