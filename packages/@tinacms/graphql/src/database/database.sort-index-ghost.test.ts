/**
 * Repro: "Error querying file <path> from collection <collection>" (surfaced as
 * "GetCollection failed: Unable to fetch"), broken ONLY for users sorting by a
 * field while default-sort users are fine.
 *
 * Index entries live in per-sort sublevels (contentLevel -> <collection> -> <sortKey>).
 * The default `__filepath__` index is keyed by the bare path, so it can't go stale.
 * A field-sort index (e.g. `score`) is keyed by `<value>\x1D<path>` and is removable
 * only by a `del` derived from that value -- so a value change/reconcile that fails to
 * `del` the old value (the incremental indexer's `if (item)` gap, or an interrupted
 * batch) strands the old key. A later delete clears the path-keyed entries but not the
 * stranded one: default list stays healthy while the field-sorted list breaks. The fix
 * makes Database.query skip an index entry whose record is gone, so these tests assert
 * the tolerant behavior (field-sorted list returns the healthy items, no throw).
 *
 * Real Database + MemoryLevel + in-memory Bridge; the desync is injected to model the
 * post-crash / post-reconcile end-state.
 */

import { describe, expect, it } from 'vitest';
import { MemoryLevel } from 'memory-level';
import { buildSchema, createDatabaseInternal } from '..';
import type { Bridge } from './bridge';
import type { Schema } from '@tinacms/schema-tools';
import { CONTENT_ROOT_PREFIX, SUBLEVEL_OPTIONS } from './level';
import { DEFAULT_COLLECTION_SORT_KEY } from './datalayer';

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
      ],
    },
  ],
};

const jsonDoc = (data: Record<string, unknown>) => JSON.stringify(data);

const GHOST = 'content/posts/ghost.json';
const KEEP = 'content/posts/keep.json';

async function setupDatabase() {
  const bridge = new InMemoryBridge();
  bridge.seed(KEEP, jsonDoc({ title: 'Keep', score: 1 }));
  bridge.seed(GHOST, jsonDoc({ title: 'Ghost', score: 42 }));

  const level = new MemoryLevel<string, Record<string, any>>({
    valueEncoding: 'json',
  });
  const database = createDatabaseInternal({
    bridge,
    level,
    tinaDirectory: 'tina',
  });
  await database.indexContent(await buildSchema({ schema: testSchema }));
  return { database };
}

// Mirrors the collection-connection resolver, which loads each node's full
// record via database.get(). The trivial `(p, v) => ({...})` hydrator used by
// other tests never calls get(), so it would NOT surface this bug.
const resolverHydrate = (database: any) => (path: string) => database.get(path);

describe('field-sort index ghost (GetCollection failed)', () => {
  it('tolerates a stranded field-sort entry instead of failing the whole collection', async () => {
    const { database } = await setupDatabase();
    const hydrate = resolverHydrate(database);

    // Healthy to start: both the default and the `score` sort resolve.
    await expect(
      database.query(
        { collection: 'post', sort: 'score', filterChain: [] },
        hydrate
      )
    ).resolves.toBeTruthy();

    // Model the desync: remove ghost's path-keyed entries (default __filepath__
    // index + CONTENT_ROOT record) but leave its real, indexer-written
    // `score` entry (`42\x1D content/posts/ghost.json`) stranded.
    const content = database.contentLevel!;
    await content
      .sublevel('post', SUBLEVEL_OPTIONS)
      .sublevel(DEFAULT_COLLECTION_SORT_KEY, SUBLEVEL_OPTIONS)
      .del(GHOST);
    await content.sublevel(CONTENT_ROOT_PREFIX, SUBLEVEL_OPTIONS).del(GHOST);

    // Default-sorted list is fine: it never reads the `score` sublevel.
    const defaultSorted = await database.query(
      { collection: 'post', filterChain: [] },
      hydrate
    );
    expect(defaultSorted.edges).toHaveLength(1);

    // Field-sorted list now skips the stranded entry and returns the healthy
    // items instead of throwing "Error querying file ... from collection".
    const fieldSorted = await database.query(
      { collection: 'post', sort: 'score', filterChain: [] },
      hydrate
    );
    expect(fieldSorted.edges).toHaveLength(1);
  });

  it('control: a normal in-band delete cleans the field-sort index (no ghost)', async () => {
    const { database } = await setupDatabase();
    const hydrate = resolverHydrate(database);

    // The in-band delete path rebuilds the field-sort `del` key from the stored
    // record, so it correctly clears the `score` entry. No strand, no error.
    await database.delete(GHOST);

    const fieldSorted = await database.query(
      { collection: 'post', sort: 'score', filterChain: [] },
      hydrate
    );
    expect(fieldSorted.edges).toHaveLength(1);
  });
});
