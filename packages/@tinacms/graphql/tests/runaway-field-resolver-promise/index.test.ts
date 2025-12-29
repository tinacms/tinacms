import { it, expect } from 'vitest';
import { MemoryLevel } from 'memory-level';
import {
  createDatabaseInternal,
  FilesystemBridge,
  resolve,
  buildSchema,
} from '../../src';
import { Schema } from '@tinacms/schema-tools';

const schema: Schema = {
  collections: [
    {
      name: 'post',
      path: 'post',
      fields: [{ type: 'string', name: 'title' }],
    },
    {
      name: 'directors',
      label: 'Directors',
      path: 'directors',
      fields: [
        { type: 'string', name: 'name' },
        { type: 'string', name: 'bio' },
      ],
    },
  ],
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

it('waits for all resolvers to complete even when one fails early', async () => {
  const testDir = __dirname;
  const bridge = new FilesystemBridge(testDir);
  const level = new MemoryLevel<string, Record<string, any>>();
  const database = createDatabaseInternal({
    bridge,
    level,
    tinaDirectory: 'tina',
  });

  await database.indexContent(await buildSchema({ schema }));

  // Track execution timeline
  const timeline: string[] = [];

  // Document get will fail immediately (NotFoundError)
  const originalGet = database.get.bind(database);
  database.get = async (...args) => {
    try {
      return await originalGet(...args);
    } catch (e) {
      timeline.push('document-error');
      throw e;
    }
  };

  // Add delay to collection query to ensure it completes AFTER the document error
  const originalQuery = database.query.bind(database);
  database.query = async (...args) => {
    await delay(250); // Ensure this runs after the document lookup fails
    const result = await originalQuery(...args);
    timeline.push('collection-complete');
    return result;
  };

  const query = `query {
    d1: document(collection: "post", relativePath: "nonexistent.md") {
      ...on Document { _values, _sys { title } }
    }
    c1: directorsConnection {
      totalCount
      edges { node { id name } }
    }
  }`;

  const result = await resolve({
    database,
    query,
    variables: {},
    silenceErrors: true,
  });

  // Verify the timeline, ensuring the error occurred first and that the collection query completed.
  expect(timeline[0]).toBe('document-error');
  expect(timeline).toContain('collection-complete');

  // Verify partial execution: error + successful data
  expect(result.errors).toBeDefined();
  expect(result.errors?.length).toBeGreaterThan(0);
});
