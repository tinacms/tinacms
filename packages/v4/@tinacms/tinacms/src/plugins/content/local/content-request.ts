// The wire protocol: one JSON request per operation, validated at the trust
// boundary. Transport-agnostic — the host (Vite middleware, express, a Next
// route) parses the HTTP body and JSONs the result back.

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
  // The v3 read surface: a raw GraphQL request, answered by graphql-pipeline.ts.
  z.object({
    op: z.literal('graphql'),
    query: z.string(),
    variables: z.record(z.string(), z.unknown()).optional(),
  }),
]);

export type ContentRequest = z.infer<typeof contentRequestSchema>;

// Returns DocumentEntry shapes for the provider ops, or the GraphQL
// { data, errors } envelope for `graphql` — the host JSONs it either way.
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
