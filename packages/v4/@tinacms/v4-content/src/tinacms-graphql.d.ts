declare module '@tinacms/graphql' {
  import type { DocumentNode } from 'graphql';

  export function buildDotTinaFiles(args: {
    config: { schema: { collections: unknown[] } };
    flags?: string[];
    buildSDK?: boolean;
  }): Promise<{
    graphQLSchema: DocumentNode;
    tinaSchema: unknown;
    lookup: Record<string, unknown>;
  }>;
}
