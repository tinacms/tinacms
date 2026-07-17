// Local typings for @tinacms/graphql, mapped in via tsconfig `paths`. The
// published d.ts is a passthrough into v3 source (tinacms-scripts emits
// `export * from "../src/index"`), which drags the whole v3 graphql+mdx source
// — and its ~150 pre-existing type errors — into this package's tsc. Typing
// just the members graphql-pipeline.ts consumes keeps the boundary typed
// without checking v3 source. Runtime behaviour is covered by
// graphql-pipeline.test.ts against the real package.
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

  export function resolve(args: {
    database: Database;
    query: string;
    variables: object;
    verbose?: boolean;
  }): Promise<unknown>;
}
