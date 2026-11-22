import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import {
  createDatabaseInternal,
  FilesystemBridge,
  type Level,
} from '@tinacms/graphql';
import { parseTinaLock } from '@tinacms/v4-content/lock';
import { type DocumentNode, print } from 'graphql';
import { SqliteLevel } from 'sqlite-level';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createGraphQLPipeline,
  type GraphQLPipeline,
} from './graphql-pipeline';

// The golden fixtures live in @tinacms/v4-content, next to its dist folder.
const FIXTURES = path.resolve(
  path.dirname(
    createRequire(import.meta.url).resolve('@tinacms/v4-content/lock')
  ),
  '../fixtures'
);

interface GoldenQuery {
  name: string;
  query: string;
  variables?: Record<string, unknown>;
}

describe.each(['kitchen-sink'])('golden fixture %s', (name) => {
  const root = path.join(FIXTURES, name);
  const read = (file: string): string =>
    readFileSync(path.join(root, file), 'utf8');

  let level: Level;
  let pipeline: GraphQLPipeline;

  beforeAll(async () => {
    level = new SqliteLevel<string, Record<string, unknown>>({
      filename: ':memory:',
      valueEncoding: 'json',
    });
    pipeline = await createGraphQLPipeline({
      rootDir: root,
      lock: parseTinaLock(read('tina-lock.json')),
      level,
    });
  });

  afterAll(() => pipeline.close());

  const indexed = () =>
    createDatabaseInternal({
      bridge: new FilesystemBridge(root),
      level,
      tinaDirectory: 'tina',
    });

  it('indexes the expected GraphQL schema', async () => {
    const schema = await indexed().getGraphQLSchema();
    expect(`${print(schema as DocumentNode)}\n`).toBe(
      read('expected/graphql.graphql')
    );
  });

  it('indexes the expected lookup', async () => {
    const lookup = await indexed().getLookup();
    expect(`${JSON.stringify(lookup, null, 2)}\n`).toBe(
      read('expected/lookup.json')
    );
  });

  it('answers each query with the expected result', async () => {
    const queries: GoldenQuery[] = JSON.parse(read('queries.json'));
    const results: Record<string, unknown> = {};
    for (const { name: queryName, query, variables } of queries) {
      results[queryName] = await pipeline.execute(query, variables);
    }
    expect(`${JSON.stringify(results, null, 2)}\n`).toBe(
      read('expected/results.json')
    );
  });
});
