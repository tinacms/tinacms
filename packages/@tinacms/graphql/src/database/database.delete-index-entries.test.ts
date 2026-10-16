/**
 * Prevention for the field-sort "ghost" that fails a collection list: a field-sort
 * index is keyed by `<value>\x1D<path>`, and delete()/deleteContentByPaths() only
 * remove the CURRENT value's key. A value change that never removed the old key
 * strands `<oldValue>\x1D<path>`; a later delete can't target it, so a field-sorted
 * query later loads its missing record and throws. Reference entries
 * (`<referencedPath>\x1D<jsonPath>\x1D<referencingPath>`) strand the same way.
 *
 * deleteIndexEntriesForPaths() matches on the path instead of the value, so it clears
 * every entry for a removed path, including stranded ones, from the collection index,
 * its folder index and the referenced collections' reference indexes.
 * Real Database + MemoryLevel + in-memory Bridge.
 */

import { describe, expect, it } from 'vitest';
import { MemoryLevel } from 'memory-level';
import { buildSchema, createDatabaseInternal } from '..';
import type { Bridge } from './bridge';
import type { Schema } from '@tinacms/schema-tools';
import { createResolver } from '../resolver';
import { encodeLocator } from '../references/visit';
import { REFS_COLLECTIONS_SORT_KEY, makeIndexSublevel } from './datalayer';
import {
  CONTENT_ROOT_PREFIX,
  INDEX_KEY_FIELD_SEPARATOR,
  SUBLEVEL_OPTIONS,
} from './level';

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
        { name: 'when', label: 'When', type: 'datetime' },
        {
          name: 'author',
          label: 'Author',
          type: 'reference',
          collections: ['author'],
        },
      ],
    },
    {
      name: 'author',
      label: 'Author',
      path: 'content/authors',
      format: 'json',
      fields: [{ name: 'name', label: 'Name', type: 'string' }],
    },
  ],
};

const jsonDoc = (data: Record<string, unknown>) => JSON.stringify(data);

const GHOST = 'content/posts/ghost.json';
const KEEP = 'content/posts/keep.json';
const A1 = 'content/authors/a1.json';
const A2 = 'content/authors/a2.json';

const refKey = (referenced: string, referencing: string) =>
  [referenced, encodeLocator(['author']), referencing].join(
    INDEX_KEY_FIELD_SEPARATOR
  );

async function setupDatabase() {
  const bridge = new InMemoryBridge();
  bridge.seed(A1, jsonDoc({ name: 'One' }));
  bridge.seed(A2, jsonDoc({ name: 'Two' }));
  bridge.seed(
    KEEP,
    jsonDoc({
      title: 'Keep',
      score: 1,
      when: '2026-01-01T00:00:00.000Z',
      author: A1,
    })
  );
  bridge.seed(
    GHOST,
    jsonDoc({
      title: 'Ghost',
      score: 42,
      when: '2026-06-30T00:00:00.000Z',
      author: A1,
    })
  );

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

async function ghostKeysIn(sublevel: any): Promise<string[]> {
  const keys: string[] = [];
  for await (const [key] of sublevel.iterator()) {
    if (key.endsWith(GHOST)) keys.push(key);
  }
  return keys;
}

describe('Database.deleteIndexEntriesForPaths()', () => {
  it('clears every sort-index entry for a path, including a stranded value key', async () => {
    const { database } = await setupDatabase();
    const content = database.contentLevel!;

    // Simulate a stranded old-value entry (from a prior un-cleaned value change)
    // in the collection and root-folder `score` and `when` sort indexes.
    const strandedKey = `OLD${INDEX_KEY_FIELD_SEPARATOR}${GHOST}`;
    for (const name of ['post', 'post_~']) {
      for (const sort of ['score', 'when']) {
        await makeIndexSublevel(
          content.sublevel(name, SUBLEVEL_OPTIONS),
          sort
        ).put(strandedKey, {} as any);
      }
    }

    // Likewise a stranded reference entry: GHOST once pointed at a2.
    const authorRefs = makeIndexSublevel(
      content.sublevel('author', SUBLEVEL_OPTIONS),
      REFS_COLLECTIONS_SORT_KEY
    );
    await authorRefs.put(refKey(A2, GHOST), {} as any);
    // And one under a collection no schema reference path names, as a reference
    // inside rich-text would leave.
    await makeIndexSublevel(
      content.sublevel('post', SUBLEVEL_OPTIONS),
      REFS_COLLECTIONS_SORT_KEY
    ).put(refKey(KEEP, GHOST), {} as any);

    await database.deleteIndexEntriesForPaths([GHOST]);

    // Iterating a collection sublevel walks every index nested under it, so this
    // holds however a sort index is named.
    for (const name of ['post', 'post_~', 'author']) {
      expect(
        await ghostKeysIn(content.sublevel(name, SUBLEVEL_OPTIONS))
      ).toEqual([]);
    }

    // The record is gone too, and (without the read-time tolerance) a field-sorted
    // query resolves cleanly rather than throwing on a dangling entry.
    const rootSub = content.sublevel(CONTENT_ROOT_PREFIX, SUBLEVEL_OPTIONS);
    expect(await rootSub.get(GHOST)).toBeUndefined();

    const hydrate = (path: string) => database.get(path);
    for (const sort of ['score', 'when']) {
      const fieldSorted = await database.query(
        { collection: 'post', sort, filterChain: [] },
        hydrate
      );
      expect(fieldSorted.edges).toHaveLength(1);
    }

    // A stranded reference entry would make the resolver load the deleted post
    // while unlinking it from a2.
    const resolver = createResolver({
      database,
      tinaSchema: await database.getSchema(),
      isAudit: false,
    });
    await expect(
      resolver.resolveDeleteDocument({
        collectionName: 'author',
        relativePath: 'a2.json',
      })
    ).resolves.toBeDefined();
  });

  it('leaves other documents untouched', async () => {
    const { database } = await setupDatabase();
    const authorRefs = makeIndexSublevel(
      database.contentLevel!.sublevel('author', SUBLEVEL_OPTIONS),
      REFS_COLLECTIONS_SORT_KEY
    );
    expect(await authorRefs.get(refKey(A1, KEEP))).toBeDefined();

    await database.deleteIndexEntriesForPaths([GHOST]);

    expect(await authorRefs.get(refKey(A1, KEEP))).toBeDefined();
    expect(await authorRefs.get(refKey(A1, GHOST))).toBeUndefined();

    const hydrate = (path: string) => database.get(path);
    const byTitle = await database.query(
      { collection: 'post', sort: 'title', filterChain: [] },
      hydrate
    );
    expect(byTitle.edges).toHaveLength(1);
    expect((byTitle.edges[0].node as any).title).toBe('Keep');
  });
});
