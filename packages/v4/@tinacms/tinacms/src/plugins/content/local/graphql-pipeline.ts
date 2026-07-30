// The v3 content pipeline, hosted by the local data layer (Node only): the same
// Database and resolve stack from @tinacms/graphql, so every v3 GraphQL query
// still works against the content v4 manages.

import {
  FilesystemBridge,
  type GraphQLResult,
  type Level,
  buildDotTinaFiles,
  createDatabaseInternal,
  resolve,
} from '@tinacms/graphql';
import { SqliteLevel } from 'sqlite-level';
import type { CollectionSchema, FieldSchema } from '../../../core/schema/types';
import { collectionFormats } from './format-adapters';

export type { GraphQLResult } from '@tinacms/graphql';
export type GraphQLVariables = Record<string, unknown>;

export interface GraphQLPipelineOptions {
  rootDir: string;
  collections: CollectionSchema[];
  // Defaults to in-memory sqlite-level; pass a file-backed store to keep the
  // index across restarts.
  level?: Level;
}

export interface GraphQLPipeline {
  execute(query: string, variables?: GraphQLVariables): Promise<GraphQLResult>;
  // Paths are posix paths from the project root.
  reindexPaths(paths: string[]): Promise<void>;
}

// v3 schema validation rejects unknown keys, so only shared properties cross
// over. `templates` must cross: without it a body holding an embed indexes as
// MDX the v3 parser cannot read.
const toV3Field = (field: FieldSchema) => ({
  type: field.type,
  name: field.name,
  label: field.label,
  required: field.required,
  isBody: field.isBody,
  ...(field.templates ? { templates: field.templates } : {}),
});

// v3 holds one format per collection, so only the primary format reaches the
// index: a mixed collection is fully editable but only partly queryable, and
// warnUnindexedFormats says so. Ends when v4 owns its index.
const toV3Collection = (collection: CollectionSchema) => ({
  name: collection.name,
  label: collection.label,
  path: collection.path,
  format: collectionFormats(collection.format)[0],
  fields: collection.fields.map(toV3Field),
});

const warnUnindexedFormats = (collections: CollectionSchema[]) => {
  for (const collection of collections) {
    const [primary, ...rest] = collectionFormats(collection.format);
    if (rest.length === 0) continue;
    console.warn(
      `Collection "${collection.name}" declares formats ${[primary, ...rest].join(', ')}, but GraphQL indexes "${primary}" only — ${rest.join(', ')} documents are editable but will not appear in query results.`
    );
  }
};

type IndexedDocument = Record<string, unknown>;

export const createGraphQLPipeline = async (
  options: GraphQLPipelineOptions
): Promise<GraphQLPipeline> => {
  warnUnindexedFormats(options.collections);
  const database = createDatabaseInternal({
    bridge: new FilesystemBridge(options.rootDir),
    level:
      options.level ??
      new SqliteLevel<string, IndexedDocument>({
        filename: ':memory:',
        valueEncoding: 'json',
      }),
    tinaDirectory: 'tina',
  });
  const schema = { collections: options.collections.map(toV3Collection) };
  const { graphQLSchema, tinaSchema, lookup } = await buildDotTinaFiles({
    // buildDotTinaFiles reads config.schema only.
    config: { schema },
    buildSDK: false,
  });
  await database.indexContent({ graphQLSchema, tinaSchema, lookup });
  // Serialises index runs: two saves must not interleave on the shared index.
  // A failed run does not block the next one.
  let indexing: Promise<void> = Promise.resolve();
  return {
    execute: (query, variables = {}) =>
      resolve({ database, query, variables, verbose: false }),
    reindexPaths: async (paths) => {
      const run = indexing
        .catch(() => {})
        .then(() => database.indexContentByPaths(paths));
      indexing = run;
      await run;
    },
  };
};
