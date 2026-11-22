declare module '@tinacms/graphql' {
  import type { AbstractLevel } from 'abstract-level';

  export type Level = AbstractLevel<
    Buffer | Uint8Array | string,
    string,
    Record<string, unknown>
  >;

  export class FilesystemBridge {
    constructor(rootPath: string, outputPath?: string);
  }

  export interface Database {
    indexContent(args: {
      graphQLSchema: unknown;
      tinaSchema: unknown;
      lookup?: object;
    }): Promise<unknown>;
    indexContentByPaths(documentPaths: string[]): Promise<void>;
    deleteContentByPaths(documentPaths: string[]): Promise<void>;
    deleteIndexEntriesForPaths(documentPaths: string[]): Promise<void>;
    getLookup(): Promise<Record<string, unknown>>;
    getGraphQLSchema(): Promise<unknown>;
  }

  export function createDatabaseInternal(config: {
    bridge: FilesystemBridge;
    level: Level;
    tinaDirectory?: string;
  }): Database;

  export interface GraphQLResult {
    data?: Record<string, unknown> | null;
    errors?: Array<{ message: string }>;
  }

  export function resolve(args: {
    database: Database;
    query: string;
    variables: object;
    verbose?: boolean;
  }): Promise<GraphQLResult>;
}
