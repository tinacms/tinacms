import { describe, expect, it } from 'vitest';
import { MemoryLevel } from 'memory-level';
import { buildSchema, createDatabaseInternal } from '..';
import type { Bridge } from './bridge';
import type { Schema } from '@tinacms/schema-tools';
import { CONTENT_ROOT_PREFIX, SUBLEVEL_OPTIONS } from './level';
import { DEFAULT_COLLECTION_SORT_KEY } from './datalayer';
import type { Database } from '.';

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

// Calls get() like the collection resolver does, so a missing record throws.
const resolverHydrate = (database: Database) => async (path: string) => {
  await database.get(path);
  return path;
};

describe('field-sort index ghost (GetCollection failed)', () => {
  it('tolerates a stranded field-sort entry instead of failing the whole collection', async () => {
    const { database } = await setupDatabase();
    const hydrate = resolverHydrate(database);

    const healthy = await database.query(
      { collection: 'post', sort: 'score', filterChain: [] },
      hydrate
    );
    expect(healthy.edges.map((edge) => edge.node)).toEqual([KEEP, GHOST]);

    const content = database.contentLevel!;
    await content
      .sublevel('post', SUBLEVEL_OPTIONS)
      .sublevel(DEFAULT_COLLECTION_SORT_KEY, SUBLEVEL_OPTIONS)
      .del(GHOST);
    await content.sublevel(CONTENT_ROOT_PREFIX, SUBLEVEL_OPTIONS).del(GHOST);

    const defaultSorted = await database.query(
      { collection: 'post', filterChain: [] },
      hydrate
    );
    expect(defaultSorted.edges.map((edge) => edge.node)).toEqual([KEEP]);

    const fieldSorted = await database.query(
      { collection: 'post', sort: 'score', filterChain: [] },
      hydrate
    );
    expect(fieldSorted.edges.map((edge) => edge.node)).toEqual([KEEP]);
  });
});
