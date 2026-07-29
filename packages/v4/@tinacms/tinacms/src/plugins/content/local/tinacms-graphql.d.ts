// The local types for @tinacms/graphql. The tsconfig `paths` field maps them in. The
// published d.ts file points into the v3 source, because tinacms-scripts emits
// `export * from "../src/index"`. That pulls the whole v3 graphql and mdx source into
// the tsc run of this package, with about 150 type errors that were already there. These
// types cover the members that graphql-pipeline.ts uses, so the boundary has types and
// tsc does not check the v3 source. graphql-pipeline.test.ts covers the runtime behaviour
// against the real package.
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
  }

  export function createDatabaseInternal(config: {
    bridge: FilesystemBridge;
    level: Level;
    tinaDirectory?: string;
  }): Database;

  export function buildDotTinaFiles(args: {
    config: { schema: { collections: unknown[] } };
    flags?: string[];
    buildSDK?: boolean;
  }): Promise<{
    graphQLSchema: unknown;
    tinaSchema: unknown;
    lookup: object;
  }>;

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
