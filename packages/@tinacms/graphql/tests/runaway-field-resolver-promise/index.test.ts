import { it, expect } from 'vitest';
import { MemoryLevel } from 'memory-level';
import {
  createDatabaseInternal,
  FilesystemBridge,
  resolve,
  buildSchema,
} from '../../src';
import { Schema } from '@tinacms/schema-tools';

const QUERY_DELAY_MS = 250;

const schema: Schema = {
  collections: [
    {
      name: 'post',
      path: 'post',
      fields: [{ type: 'string', name: 'title' }],
    },
    {
      name: 'authors',
      label: 'Authors',
      path: 'authors',
      fields: [
        { type: 'string', name: 'name' },
        { type: 'string', name: 'bio' },
      ],
    },
  ],
};

const sleep = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

it('waits for all resolvers to complete even when one fails early', async () => {
  const testDir = __dirname;
  const bridge = new FilesystemBridge(testDir);
  const level = new MemoryLevel<string, Record<string, any>>();
  const database = createDatabaseInternal({
    bridge,
    level,
    tinaDirectory: 'tina',
  });
  await database.indexContent(
    await buildSchema({
      schema,
      build: {
        publicFolder: 'public',
        outputFolder: 'admin',
      },
    })
  );
  const timeline: string[] = [];

  // Document get will fail immediately (NotFoundError).
  const originalGet = database.get.bind(database);
  database.get = async (...args) => {
    try {
      return await originalGet(...args);
    } catch (e) {
      timeline.push('document-error');
      throw e;
    }
  };

  // Add delay to collection query to ensure it completes after the document error.
  const originalQuery = database.query.bind(database);
  database.query = async (...args) => {
    await sleep(QUERY_DELAY_MS);
    const result = await originalQuery(...args);
    timeline.push('collection-complete');
    return result;
  };

  const query = `query {
    nonExistantPost: document(collection: "post", relativePath: "nonexistent.md") {
      ...on Document { _values, _sys { title } }
    }
    allAuthors: authorsConnection {
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

  // Verify error returned.
  expect(result.errors).toBeDefined();
  expect(result.errors?.length).toBeGreaterThan(0);
});
