// The wire protocol. Each operation is one JSON request, and this file validates it at
// the trust boundary. It knows no transport. The host parses the HTTP body, and writes
// the result back as JSON. That host is a Vite middleware, an express server, or a
// Next.js route.

import { z } from 'zod';
import type { DocumentEntry } from '../../../core/content/contract';
import type { GraphQLResult } from './graphql-pipeline';
import type { LocalDataLayer } from './local-data-layer';

const contentRequestSchema = z.discriminatedUnion('op', [
  z.object({ op: z.literal('list'), collection: z.string() }),
  z.object({ op: z.literal('get'), collection: z.string(), path: z.string() }),
  z.object({
    op: z.literal('update'),
    collection: z.string(),
    path: z.string(),
    value: z.record(z.string(), z.unknown()),
  }),
  // The v3 read interface. It is a GraphQL request, and graphql-pipeline.ts answers it.
  z.object({
    op: z.literal('graphql'),
    query: z.string(),
    variables: z.record(z.string(), z.unknown()).optional(),
  }),
]);

export type ContentRequest = z.infer<typeof contentRequestSchema>;

// This returns a DocumentEntry for a provider operation, and the GraphQL
// { data, errors } object for `graphql`. The host writes either one as JSON.
export const dispatchContentRequest = async (
  provider: LocalDataLayer,
  request: unknown
): Promise<DocumentEntry[] | DocumentEntry | null | GraphQLResult> => {
  const parsed = contentRequestSchema.parse(request);
  switch (parsed.op) {
    case 'list':
      return provider.list(parsed.collection);
    case 'get':
      return provider.get(parsed.collection, parsed.path);
    case 'update':
      return provider.update(parsed.collection, parsed.path, parsed.value);
    case 'graphql':
      return provider.graphql(parsed.query, parsed.variables);
  }
};
