import { describe, expect, it } from 'vitest';
import type { DocumentSummary } from './contract';
import { queryDocuments } from './list-query';

const doc = (
  path: string,
  extra: Partial<DocumentSummary> = {}
): DocumentSummary => ({ path, ...extra });

const summaries = [
  doc('content/posts/b.md', {
    title: 'Beta',
    updatedAt: '2026-01-02T00:00:00Z',
  }),
  doc('content/posts/a.md', {
    title: 'Álpha',
    updatedAt: '2026-01-03T00:00:00Z',
  }),
  doc('content/posts/undated.md'),
  doc('content/posts/2026/c.md', { updatedAt: '2026-01-01T00:00:00Z' }),
  doc('content/posts/2026/d/e.md'),
  doc('content/posts/.gitkeep.md'),
];

const root = 'content/posts';
const paths = (connection: ReturnType<typeof queryDocuments>) =>
  connection.edges.map(({ node }) => node.path);

describe('queryDocuments', () => {
  it('lists every document at every depth in path order, without placeholders or folders', () => {
    const result = queryDocuments({ summaries, root });
    expect(paths(result)).toEqual([
      'content/posts/2026/c.md',
      'content/posts/2026/d/e.md',
      'content/posts/a.md',
      'content/posts/b.md',
      'content/posts/undated.md',
    ]);
    expect(result.totalCount).toBe(5);
    expect(result.folders).toEqual([]);
  });

  it('scopes to one folder level and counts documents below each folder', () => {
    const top = queryDocuments({ summaries, root, query: { folder: '' } });
    expect(paths(top)).toEqual([
      'content/posts/a.md',
      'content/posts/b.md',
      'content/posts/undated.md',
    ]);
    expect(top.folders).toEqual([
      { path: '2026', name: '2026', documentCount: 2 },
    ]);
    const nested = queryDocuments({
      summaries,
      root,
      query: { folder: '2026' },
    });
    expect(paths(nested)).toEqual(['content/posts/2026/c.md']);
    expect(nested.folders).toEqual([
      { path: '2026/d', name: 'd', documentCount: 1 },
    ]);
  });

  it('lists an empty folder with 0 documents', () => {
    const result = queryDocuments({
      summaries,
      root,
      emptyFolders: ['drafts'],
      query: { folder: '' },
    });
    expect(result.folders).toContainEqual({
      path: 'drafts',
      name: 'drafts',
      documentCount: 0,
    });
  });

  it('filters by shown name or file name after NFKC and lower-casing, literally', () => {
    const accent = queryDocuments({
      summaries,
      root,
      query: { filter: 'ÁLPHA' },
    });
    expect(paths(accent)).toEqual(['content/posts/a.md']);
    const file = queryDocuments({ summaries, root, query: { filter: '.md' } });
    expect(file.totalCount).toBe(5);
    expect(
      queryDocuments({ summaries, root, query: { filter: '(' } }).totalCount
    ).toBe(0);
  });

  it('sorts undated documents last in both directions, ties by path', () => {
    for (const direction of ['asc', 'desc'] as const) {
      const result = queryDocuments({
        summaries,
        root,
        query: { sort: { by: 'updatedAt', direction } },
      });
      expect(paths(result).slice(-2)).toEqual([
        'content/posts/2026/d/e.md',
        'content/posts/undated.md',
      ]);
    }
    const desc = queryDocuments({
      summaries,
      root,
      query: { sort: { by: 'updatedAt', direction: 'desc' } },
    });
    expect(paths(desc)[0]).toBe('content/posts/a.md');
  });

  it('pages with opaque cursors and a stable total', () => {
    const many = Array.from({ length: 120 }, (_, i) =>
      doc(`content/posts/p${String(i).padStart(3, '0')}.md`)
    );
    const sizes: number[] = [];
    let after: string | undefined;
    for (;;) {
      const page = queryDocuments({
        summaries: many,
        root,
        query: { first: 50, after },
      });
      sizes.push(page.edges.length);
      expect(page.totalCount).toBe(120);
      if (!page.pageInfo.hasNextPage) break;
      after = page.pageInfo.endCursor ?? undefined;
    }
    expect(sizes).toEqual([50, 50, 20]);
  });

  it('does not skip a row when the last row of page 1 is deleted between reads', () => {
    const many = Array.from({ length: 6 }, (_, i) =>
      doc(`content/posts/p${i}.md`)
    );
    const first = queryDocuments({
      summaries: many,
      root,
      query: { first: 3 },
    });
    const cursor = first.pageInfo.endCursor ?? undefined;
    const without = many.filter(({ path }) => path !== 'content/posts/p2.md');
    const second = queryDocuments({
      summaries: without,
      root,
      query: { first: 3, after: cursor },
    });
    expect(paths(second)).toEqual([
      'content/posts/p3.md',
      'content/posts/p4.md',
      'content/posts/p5.md',
    ]);
  });

  it('refuses a bad cursor and a page size above 200', () => {
    expect(() =>
      queryDocuments({ summaries, root, query: { after: 'nope' } })
    ).toThrow(/cursor/);
    expect(() =>
      queryDocuments({ summaries, root, query: { first: 201 } })
    ).toThrow(/first/);
  });
});
