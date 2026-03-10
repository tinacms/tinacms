/**
 * Integration tests for the Database class.
 *
 * Uses MemoryLevel as the database adapter and an InMemoryBridge (no filesystem
 * access) so these tests run without any fixture files on disk.
 *
 * Tests call database.query() / database.put() / database.delete() directly
 * rather than through the GraphQL resolver.  This complements the existing
 * GraphQL integration tests which exercise the full resolver stack but do
 * not verify low-level indexing behaviour in isolation.
 *
 * NOTE: When calling database.query() directly (not through the GraphQL
 * resolver), you must always pass filterChain: [] when no filter is needed.
 * The resolver always supplies an array; database.query() calls
 * coerceFilterChainOperands() which throws on undefined.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryLevel } from 'memory-level';
import { buildSchema, createDatabaseInternal } from '..';
import type { Bridge } from './bridge';
import type { Schema } from '@tinacms/schema-tools';
import { atob } from '../util';

// ─── InMemoryBridge ──────────────────────────────────────────────────────────

/**
 * A simple in-memory implementation of Bridge.
 *
 * Stores files in a Map keyed by filepath so _indexAllContent can read
 * content without touching the filesystem.
 */
class InMemoryBridge implements Bridge {
  rootPath = '';
  private files: Map<string, string> = new Map();

  seed(filepath: string, content: string) {
    this.files.set(filepath, content);
    return this;
  }

  async glob(pattern: string, extension: string): Promise<string[]> {
    return Array.from(this.files.keys()).filter(
      (p) => p.startsWith(pattern) && p.endsWith(`.${extension}`)
    );
  }

  async get(filepath: string): Promise<string> {
    const content = this.files.get(filepath);
    if (content === undefined)
      throw new Error(`InMemoryBridge: file not found: ${filepath}`);
    return content;
  }

  async put(filepath: string, data: string): Promise<void> {
    this.files.set(filepath, data);
  }

  async delete(filepath: string): Promise<void> {
    this.files.delete(filepath);
  }
}

// ─── Schema ──────────────────────────────────────────────────────────────────

// Minimal collection with sortable / filterable fields.
// Using format: 'json' avoids markdown body-field complexity.
const testSchema: Schema = {
  collections: [
    {
      name: 'post',
      label: 'Post',
      path: 'content/posts',
      format: 'json',
      fields: [
        { name: 'title', label: 'Title', type: 'string' },
        { name: 'score', label: 'Score', type: 'number' },
        { name: 'published', label: 'Published', type: 'boolean' },
      ],
    },
  ],
};

const jsonDoc = (data: Record<string, unknown>) => JSON.stringify(data);

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const POSTS = [
  {
    path: 'content/posts/alpha.json',
    data: { title: 'Alpha', score: 1, published: true },
  },
  {
    path: 'content/posts/beta.json',
    data: { title: 'Beta', score: 2, published: false },
  },
  {
    path: 'content/posts/gamma.json',
    data: { title: 'Gamma', score: 3, published: true },
  },
  {
    path: 'content/posts/delta.json',
    data: { title: 'Delta', score: 4, published: false },
  },
  {
    path: 'content/posts/epsilon.json',
    data: { title: 'Epsilon', score: 5, published: true },
  },
] as const;

// ─── Setup helper ────────────────────────────────────────────────────────────

type PostFixture = { path: string; data: Record<string, unknown> };

async function setupDatabase(seed: readonly PostFixture[] = POSTS) {
  const bridge = new InMemoryBridge();
  for (const { path, data } of seed) {
    bridge.seed(path, jsonDoc(data));
  }

  const level = new MemoryLevel<string, Record<string, any>>({
    valueEncoding: 'json',
  });
  const database = createDatabaseInternal({
    bridge,
    level,
    tinaDirectory: 'tina',
  });

  const builtSchema = await buildSchema({ schema: testSchema });
  await database.indexContent(builtSchema);

  // Simple hydrator: spreads the index-extracted value into the returned node.
  const hydrate = async (path: string, value: Record<string, any>) => ({
    path,
    ...value,
  });

  return { database, bridge, hydrate };
}

// Shorthand: query without any filter (filterChain must be [] not undefined)
function noFilter() {
  return [];
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Database.query()', () => {
  it('returns all indexed documents (default limit 50)', async () => {
    const { database, hydrate } = await setupDatabase();
    const result = await database.query(
      { collection: 'post', filterChain: noFilter() },
      hydrate
    );
    expect(result.edges).toHaveLength(POSTS.length);
  });

  describe('forward pagination', () => {
    it('respects the "first" limit and sets hasNextPage', async () => {
      const { database, hydrate } = await setupDatabase();
      const result = await database.query(
        { collection: 'post', first: 2, filterChain: noFilter() },
        hydrate
      );
      expect(result.edges).toHaveLength(2);
      expect(result.pageInfo.hasNextPage).toBe(true);
      expect(result.pageInfo.hasPreviousPage).toBe(false);
    });

    it('pages through all documents using "after" cursor without duplicates', async () => {
      const { database, hydrate } = await setupDatabase();
      const allPaths: string[] = [];
      let after: string | undefined;

      for (let page = 0; page < 10; page++) {
        const result = await database.query(
          { collection: 'post', first: 2, after, filterChain: noFilter() },
          hydrate
        );
        for (const edge of result.edges) allPaths.push((edge.node as any).path);
        if (!result.pageInfo.hasNextPage) break;
        after = result.pageInfo.endCursor;
      }

      expect(allPaths).toHaveLength(POSTS.length);
      expect(new Set(allPaths).size).toBe(POSTS.length);
    });
  });

  describe('backward pagination', () => {
    it('respects the "last" limit and sets hasPreviousPage', async () => {
      const { database, hydrate } = await setupDatabase();
      const result = await database.query(
        { collection: 'post', last: 2, filterChain: noFilter() },
        hydrate
      );
      expect(result.edges).toHaveLength(2);
      expect(result.pageInfo.hasPreviousPage).toBe(true);
      expect(result.pageInfo.hasNextPage).toBe(false);
    });

    it('returns all remaining items before the startCursor in a single over-request', async () => {
      const { database, hydrate } = await setupDatabase();

      // Get the last 1 item to obtain a cursor
      const lastPage = await database.query(
        { collection: 'post', last: 1, filterChain: noFilter() },
        hydrate
      );
      expect(lastPage.edges).toHaveLength(1);
      expect(lastPage.pageInfo.hasPreviousPage).toBe(true);

      // Fetch all remaining items before that cursor in a single request
      const prevPage = await database.query(
        {
          collection: 'post',
          last: 50,
          before: lastPage.pageInfo.startCursor,
          filterChain: noFilter(),
        },
        hydrate
      );
      // Should return all 4 remaining documents without duplicates
      expect(prevPage.edges).toHaveLength(POSTS.length - 1);
      expect(prevPage.pageInfo.hasPreviousPage).toBe(false);
    });
  });

  describe('sorting', () => {
    it('sorts by title index in ascending lexicographic order', async () => {
      const { database, hydrate } = await setupDatabase();
      const result = await database.query(
        { collection: 'post', sort: 'title', filterChain: noFilter() },
        hydrate
      );
      const titles = result.edges.map((e) => (e.node as any).title);
      expect(titles).toEqual(['Alpha', 'Beta', 'Delta', 'Epsilon', 'Gamma']);
    });

    it('sorts by score index in ascending numeric order', async () => {
      const { database, hydrate } = await setupDatabase();
      const result = await database.query(
        { collection: 'post', sort: 'score', filterChain: noFilter() },
        hydrate
      );
      const scores = result.edges.map((e) => Number((e.node as any).score));
      expect(scores).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('filtering', () => {
    it('eq filter returns only the matching document', async () => {
      const { database, hydrate } = await setupDatabase();
      const result = await database.query(
        {
          collection: 'post',
          sort: 'title',
          filterChain: [
            {
              pathExpression: 'title',
              rightOperand: 'Alpha',
              operator: 'eq' as any,
              type: 'string',
              list: false,
            },
          ],
        },
        hydrate
      );
      expect(result.edges).toHaveLength(1);
      expect((result.edges[0].node as any).title).toBe('Alpha');
    });

    it('startsWith filter returns only prefix-matching documents', async () => {
      const { database, hydrate } = await setupDatabase();
      // Only 'Alpha' starts with 'Al'
      const result = await database.query(
        {
          collection: 'post',
          sort: 'title',
          filterChain: [
            {
              pathExpression: 'title',
              rightOperand: 'Al',
              operator: 'startsWith' as any,
              type: 'string',
              list: false,
            },
          ],
        },
        hydrate
      );
      expect(result.edges).toHaveLength(1);
      expect((result.edges[0].node as any).title).toBe('Alpha');
    });
  });

  describe('pageInfo cursors', () => {
    it('returns decodable base64 cursors', async () => {
      const { database, hydrate } = await setupDatabase();
      const result = await database.query(
        { collection: 'post', first: 2, filterChain: noFilter() },
        hydrate
      );
      const { startCursor, endCursor } = result.pageInfo;
      expect(startCursor).toBeTruthy();
      expect(endCursor).toBeTruthy();
      expect(() => atob(startCursor)).not.toThrow();
      expect(() => atob(endCursor)).not.toThrow();
    });

    it('returns empty cursors when the result set is empty', async () => {
      const { database, hydrate } = await setupDatabase([]);
      const result = await database.query(
        { collection: 'post', filterChain: noFilter() },
        hydrate
      );
      expect(result.edges).toHaveLength(0);
      expect(atob(result.pageInfo.startCursor)).toBe('');
    });
  });
});

describe('Database.put() and Database.delete()', () => {
  it('put() makes a new document queryable', async () => {
    const { database, hydrate } = await setupDatabase([]);

    await database.put(
      'content/posts/new.json',
      { title: 'New Post', score: 99, published: true },
      'post'
    );

    const result = await database.query(
      { collection: 'post', filterChain: noFilter() },
      hydrate
    );
    expect(result.edges).toHaveLength(1);
    expect((result.edges[0].node as any).path).toBe('content/posts/new.json');
  });

  it('put() indexes the document so it appears in a sort-ordered query', async () => {
    const { database, hydrate } = await setupDatabase([]);

    await database.put(
      'content/posts/a.json',
      { title: 'Alpha', score: 1, published: true },
      'post'
    );
    await database.put(
      'content/posts/b.json',
      { title: 'Beta', score: 2, published: false },
      'post'
    );

    const result = await database.query(
      { collection: 'post', sort: 'title', filterChain: noFilter() },
      hydrate
    );
    const titles = result.edges.map((e) => (e.node as any).title);
    expect(titles).toEqual(['Alpha', 'Beta']);
  });

  it('put() updates an existing document so the new values are retrievable', async () => {
    const { database } = await setupDatabase([
      {
        path: 'content/posts/post.json',
        data: { title: 'Old Title', score: 1, published: true },
      },
    ]);

    await database.put(
      'content/posts/post.json',
      { title: 'New Title', score: 1, published: true },
      'post'
    );

    const raw = await database.get<Record<string, unknown>>(
      'content/posts/post.json'
    );
    expect(raw.title).toBe('New Title');
  });

  it('delete() removes a document so it no longer appears in queries', async () => {
    const { database, hydrate } = await setupDatabase([
      {
        path: 'content/posts/a.json',
        data: { title: 'Alpha', score: 1, published: true },
      },
      {
        path: 'content/posts/b.json',
        data: { title: 'Beta', score: 2, published: false },
      },
    ]);

    await database.delete('content/posts/a.json');

    const result = await database.query(
      { collection: 'post', filterChain: noFilter() },
      hydrate
    );
    expect(result.edges).toHaveLength(1);
    expect((result.edges[0].node as any).path).toBe('content/posts/b.json');
  });

  it('delete() removes the document from sorted indexes too', async () => {
    const { database, hydrate } = await setupDatabase([
      {
        path: 'content/posts/a.json',
        data: { title: 'Alpha', score: 1, published: true },
      },
      {
        path: 'content/posts/b.json',
        data: { title: 'Beta', score: 2, published: false },
      },
    ]);

    await database.delete('content/posts/a.json');

    const result = await database.query(
      { collection: 'post', sort: 'title', filterChain: noFilter() },
      hydrate
    );
    expect(result.edges).toHaveLength(1);
    expect((result.edges[0].node as any).title).toBe('Beta');
  });

  it('put() without collectionName throws because index definitions cannot be resolved', async () => {
    // When collectionName is omitted, database.put() cannot look up the index
    // definitions and throws rather than silently storing an un-indexed document.
    const { database } = await setupDatabase([]);

    await expect(
      database.put('content/posts/ghost.json', {
        title: 'Ghost',
        score: 99,
        published: true,
      })
    ).rejects.toThrow();
  });
});

describe('Database.getMetadata() and setMetadata()', () => {
  it('round-trips a string value', async () => {
    const { database } = await setupDatabase([]);
    await database.setMetadata('version', '1.2.3');
    expect(await database.getMetadata('version')).toBe('1.2.3');
  });

  it('returns undefined for a key that was never set', async () => {
    const { database } = await setupDatabase([]);
    expect(await database.getMetadata('nonexistent')).toBeUndefined();
  });
});

describe('Database.deleteContentByPaths()', () => {
  it('removes the document from all indexes so it no longer appears in queries', async () => {
    const { database, hydrate } = await setupDatabase([
      {
        path: 'content/posts/a.json',
        data: { title: 'Alpha', score: 1, published: true },
      },
      {
        path: 'content/posts/b.json',
        data: { title: 'Beta', score: 2, published: false },
      },
    ]);

    await database.deleteContentByPaths(['content/posts/a.json']);

    const result = await database.query(
      { collection: 'post', filterChain: noFilter() },
      hydrate
    );
    expect(result.edges).toHaveLength(1);
    expect((result.edges[0].node as any).path).toBe('content/posts/b.json');
  });

  it('removes the document from sorted indexes too', async () => {
    const { database, hydrate } = await setupDatabase([
      {
        path: 'content/posts/a.json',
        data: { title: 'Alpha', score: 1, published: true },
      },
      {
        path: 'content/posts/b.json',
        data: { title: 'Beta', score: 2, published: false },
      },
    ]);

    await database.deleteContentByPaths(['content/posts/a.json']);

    const result = await database.query(
      { collection: 'post', sort: 'title', filterChain: noFilter() },
      hydrate
    );
    expect(result.edges).toHaveLength(1);
    expect((result.edges[0].node as any).title).toBe('Beta');
  });
});

describe('Database.indexContentByPaths()', () => {
  it('makes a newly added bridge file queryable without full re-index', async () => {
    const bridge = new InMemoryBridge();
    bridge.seed(
      'content/posts/a.json',
      jsonDoc({ title: 'A', score: 1, published: true })
    );

    const level = new MemoryLevel<string, Record<string, any>>({
      valueEncoding: 'json',
    });
    const database = createDatabaseInternal({
      bridge,
      level,
      tinaDirectory: 'tina',
    });
    const builtSchema = await buildSchema({ schema: testSchema });
    await database.indexContent(builtSchema);

    // Add a new file to the bridge, then partially reindex just that file
    bridge.seed(
      'content/posts/b.json',
      jsonDoc({ title: 'B', score: 2, published: false })
    );
    await database.indexContentByPaths(['content/posts/b.json']);

    const hydrate = async (path: string, value: any) => ({ path, ...value });
    const result = await database.query(
      { collection: 'post', filterChain: noFilter() },
      hydrate
    );
    expect(result.edges).toHaveLength(2);
  });
});

describe('Database.query() — filter on non-sort field', () => {
  it('returns only matching documents when filter field differs from sort field', async () => {
    // Filtering on "published" (boolean) while sorted by "title" means
    // makeFilterSuffixes returns undefined (filter path not in sort index),
    // so the query falls back to loading each full record from rootLevel.
    const { database, hydrate } = await setupDatabase();
    const result = await database.query(
      {
        collection: 'post',
        sort: 'title',
        filterChain: [
          {
            pathExpression: 'published',
            rightOperand: true,
            operator: 'eq' as any,
            type: 'boolean',
            list: false,
          },
        ],
      },
      hydrate
    );
    // alpha, gamma, epsilon are published: true
    expect(result.edges).toHaveLength(3);
    const titles = result.edges.map((e) => (e.node as any).title);
    expect(titles).toEqual(['Alpha', 'Epsilon', 'Gamma']);
  });
});

describe('Database.indexContent()', () => {
  it('re-indexing picks up new content from the bridge', async () => {
    const bridge = new InMemoryBridge();
    bridge.seed(
      'content/posts/a.json',
      jsonDoc({ title: 'A', score: 1, published: true })
    );

    const level = new MemoryLevel<string, Record<string, any>>({
      valueEncoding: 'json',
    });
    const database = createDatabaseInternal({
      bridge,
      level,
      tinaDirectory: 'tina',
    });
    const builtSchema = await buildSchema({ schema: testSchema });

    await database.indexContent(builtSchema);

    // Add a second file then re-index
    bridge.seed(
      'content/posts/b.json',
      jsonDoc({ title: 'B', score: 2, published: false })
    );
    database.clearCache();
    await database.indexContent(builtSchema);

    const hydrate = async (path: string, value: any) => ({ path, ...value });
    const result = await database.query(
      { collection: 'post', filterChain: noFilter() },
      hydrate
    );
    expect(result.edges).toHaveLength(2);
  });
});
