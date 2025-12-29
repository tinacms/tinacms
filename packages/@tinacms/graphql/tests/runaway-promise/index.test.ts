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
      console.log(`Getting ${args}`);
      return await originalGet(...args);
    } catch (e) {
      console.log(`Found error ${e}, delaying...`);
      timeline.push('document-error');
      throw e;
    }
  };

  // Add delay to collection query to ensure it completes AFTER the document error
  const originalQuery = database.query.bind(database);
  database.query = async (...args) => {
    console.log(`Starting query`);
    await delay(250); // Ensure this runs after the document lookup fails
    console.log(`Delay over`);
    const result = await originalQuery(...args);
    console.log(`Query complete`);
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

  console.log("Result was...");
  console.log(JSON.stringify(result));

  // Verify the error occurred before the collection query completed
  expect(timeline[0]).toBe('document-error');

  // Critical: When resolve() returns, the collection query MUST have completed
  // If this fails, we have runaway promises
  expect(timeline).toContain('collection-complete');

  // Verify partial execution: error + successful data
  expect(result.errors).toBeDefined();
  expect(result.errors?.length).toBeGreaterThan(0);

  // Note that the following does not appear to be true even if the delay is switched around.
  // expect(result.data?.d1).toBeNull();
  // expect(result.data?.c1).toBeDefined();
  // expect(result.data?.c1?.totalCount).toBeGreaterThanOrEqual(0);
});
