// The v3 content pipeline, hosted by the local data layer. It runs in Node only. It is
// the same Database and resolve stack from @tinacms/graphql that the v3 CLI ran. It
// indexes the local files into an abstract-level store, through the sqlite-level adapter
// that this project maintains. Every v3 GraphQL query therefore still works against the
// content that v4 manages.

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
  /**
   * Any abstract-level store. It defaults to an in-memory sqlite-level store. Pass a
   * store backed by a file to keep the index across restarts.
   */
  level?: Level;
}

export interface GraphQLPipeline {
  /**
   * Run one v3 GraphQL request. It returns the standard `{ data, errors }` object.
   */
  execute(query: string, variables?: GraphQLVariables): Promise<GraphQLResult>;
  /**
   * Index the saved documents again, so that the next execute sees them. The paths are
   * posix paths from the project root.
   */
  reindexPaths(paths: string[]): Promise<void>;
}

/**
 * One v4 field, in the shape that the v3 schema builder reads.
 *
 * The schema validation of v3 rejects an unknown key, so only the properties that both
 * models share cross over. A property that belongs to v4 alone stays out. The validation
 * rules and the UI config are two examples.
 *
 * `templates` crosses over too. v3 models it under the same name. Without it, a body
 * that holds an embed indexes as MDX that the v3 parser cannot read, while the editor
 * renders that same body correctly.
 */
const toV3Field = (field: FieldSchema) => ({
  type: field.type,
  name: field.name,
  label: field.label,
  required: field.required,
  isBody: field.isBody,
  ...(field.templates ? { templates: field.templates } : {}),
});

/**
 * One v4 collection, in the shape that the v3 schema builder reads.
 *
 * v3 holds one format for each collection. It globs for `${path}/**.${format}`, and it
 * then compares the extension of each candidate file. Only the primary format therefore
 * reaches the index. A collection with mixed formats is fully editable, because the file
 * provider dispatches for each file, but it is only partly queryable.
 * warnUnindexedFormats reports that, instead of a half-index with no message. This ends
 * when v4 owns its index.
 */
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
    /**
     * buildDotTinaFiles reads config.schema only. The full v3 Config, with the branch,
     * the client id, and the media, has no local equivalent.
     */
    config: { schema },
    buildSDK: false,
  });
  await database.indexContent({ graphQLSchema, tinaSchema, lookup });
  /**
   * The queue of index runs. A reindex runs alone. Two saves at the same time must not
   * interleave a read, a change, and a write on the shared index. A failed run does not
   * block the next one.
   */
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
