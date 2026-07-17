// Node-only — the v3 content pipeline, hosted by the Local Data Layer: the same
// @tinacms/graphql Database/resolve stack the v3 CLI ran, indexing local files
// into an abstract-level store (sqlite-level, the adapter we maintain). Keeps
// every v3 GraphQL query working against v4-managed content.

import {
  FilesystemBridge,
  type Level,
  buildDotTinaFiles,
  createDatabaseInternal,
  resolve,
} from '@tinacms/graphql';
import { SqliteLevel } from 'sqlite-level';
import type { CollectionSchema, FieldSchema } from '../../../core/schema/types';

export interface GraphQLPipelineOptions {
  rootDir: string;
  collections: CollectionSchema[];
  // Any abstract-level store; defaults to an in-memory sqlite-level. Pass a
  // file-backed one to persist the index across restarts.
  level?: Level;
}

export interface GraphQLPipeline {
  // Runs one v3 GraphQL request; returns the standard { data, errors } envelope.
  execute(query: string, variables?: Record<string, unknown>): Promise<unknown>;
  // Re-index saved documents (root-relative posix paths) so the next execute
  // sees them.
  reindexPaths(paths: string[]): Promise<void>;
}

// v3's schema validation rejects unknown keys, so only the props both models
// share cross over; v4-only field props (validation rules, ui config) stay out.
const toV3Field = (field: FieldSchema) => ({
  type: field.type,
  name: field.name,
  label: field.label,
  required: field.required,
  isBody: field.isBody,
});

const toV3Collection = (collection: CollectionSchema) => ({
  name: collection.name,
  label: collection.label,
  path: collection.path,
  format: collection.format,
  fields: collection.fields.map(toV3Field),
});

export const createGraphQLPipeline = async (
  options: GraphQLPipelineOptions
): Promise<GraphQLPipeline> => {
  const database = createDatabaseInternal({
    bridge: new FilesystemBridge(options.rootDir),
    level:
      options.level ??
      new SqliteLevel<string, Record<string, unknown>>({
        filename: ':memory:',
        valueEncoding: 'json',
      }),
    tinaDirectory: 'tina',
  });
  const schema = { collections: options.collections.map(toV3Collection) };
  const { graphQLSchema, tinaSchema, lookup } = await buildDotTinaFiles({
    // buildDotTinaFiles only reads config.schema; the full v3 Config surface
    // (branch, clientId, media…) has no local equivalent.
    config: { schema },
    buildSDK: false,
  });
  await database.indexContent({ graphQLSchema, tinaSchema, lookup });
  // Reindexes run one at a time — concurrent saves must not interleave
  // read-modify-write on the shared index. A failed run doesn't block the next.
  let indexing: Promise<unknown> = Promise.resolve();
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
