import {
  FilesystemBridge,
  type GraphQLResult,
  type Level,
  buildDotTinaFiles,
  createDatabaseInternal,
  resolve,
} from '@tinacms/graphql';
import { SqliteLevel } from 'sqlite-level';
import type {
  CollectionSchema,
  FieldSchema,
} from '../../../../core/schema/types';
import { collectionFormats } from '../adapters/format-adapters';

export type { GraphQLResult } from '@tinacms/graphql';
export type GraphQLVariables = Record<string, unknown>;

export interface GraphQLPipelineOptions {
  rootDir: string;
  collections: CollectionSchema[];
  level?: Level;
}

export interface GraphQLPipeline {
  execute(query: string, variables?: GraphQLVariables): Promise<GraphQLResult>;
  reindexPaths(paths: string[]): Promise<void>;
  close(): Promise<void>;
}

const toV3Field = (field: FieldSchema) => ({
  type: field.type,
  name: field.name,
  label: field.label,
  required: field.required,
  isBody: field.isBody,
  ...(field.templates ? { templates: field.templates } : {}),
});

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
  const level =
    options.level ??
    new SqliteLevel<string, IndexedDocument>({
      filename: ':memory:',
      valueEncoding: 'json',
    });
  const database = createDatabaseInternal({
    bridge: new FilesystemBridge(options.rootDir),
    level,
    tinaDirectory: 'tina',
  });
  const schema = { collections: options.collections.map(toV3Collection) };
  const { graphQLSchema, tinaSchema, lookup } = await buildDotTinaFiles({
    config: { schema },
    buildSDK: false,
  });
  await database.indexContent({ graphQLSchema, tinaSchema, lookup });
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
    close: async () => {
      await indexing.catch(() => {});
      await level.close();
    },
  };
};
