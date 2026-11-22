import {
  createDatabaseInternal,
  FilesystemBridge,
  type GraphQLResult,
  type Level,
  resolve,
} from '@tinacms/graphql';
import { lockToGraphQL } from '@tinacms/v4-content/graphql';
import type { TinaLock } from '@tinacms/v4-content/lock';
import { SqliteLevel } from 'sqlite-level';

export type { GraphQLResult } from '@tinacms/graphql';
export type GraphQLVariables = Record<string, unknown>;

export interface GraphQLPipelineOptions {
  rootDir: string;
  /** The lock as JSON gives it, so the pipeline reads what TinaCloud reads. */
  lock: Pick<TinaLock, 'schema'>;
  level?: Level;
}

export interface GraphQLPipeline {
  execute(query: string, variables?: GraphQLVariables): Promise<GraphQLResult>;
  reindexPaths(paths: string[]): Promise<void>;
  /** Drops removed documents from the index, with their sort-index entries. */
  removePaths(paths: string[]): Promise<void>;
  close(): Promise<void>;
}

type IndexedDocument = Record<string, unknown>;

export const createGraphQLPipeline = async (
  options: GraphQLPipelineOptions
): Promise<GraphQLPipeline> => {
  const { graphQLSchema, tinaSchema, lookup, skipped, warnings } =
    await lockToGraphQL(options.lock);
  for (const warning of warnings) console.warn(warning);
  for (const { collection, reason } of skipped) {
    console.warn(
      `Collection "${collection}" is not in GraphQL, and its documents will not appear in query results. ${reason}`
    );
  }
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
    removePaths: async (paths) => {
      const run = indexing
        .catch(() => {})
        .then(async () => {
          await database.deleteContentByPaths(paths);
          await database.deleteIndexEntriesForPaths(paths);
        });
      indexing = run;
      await run;
    },
    close: async () => {
      await indexing.catch(() => {});
      await level.close();
    },
  };
};
