import { z } from 'zod';
import type { DocumentEntry } from '../../../../core/content/contract';
import type { GraphQLResult } from '../graphql/graphql-pipeline';
import type { LocalDataLayer } from './local-data-layer';

const withoutStringsAndComments = (document: string): string => {
  let stripped = '';
  let index = 0;
  while (index < document.length) {
    if (document[index] === '#') {
      while (index < document.length && document[index] !== '\n') index += 1;
      continue;
    }
    if (document[index] !== '"') {
      stripped += document[index];
      index += 1;
      continue;
    }
    const isBlock = document.startsWith('"""', index);
    index += isBlock ? 3 : 1;
    while (index < document.length) {
      if (!isBlock && document[index] === '\\') {
        index += 2;
        continue;
      }
      if (
        isBlock ? document.startsWith('"""', index) : document[index] === '"'
      ) {
        index += isBlock ? 3 : 1;
        break;
      }
      index += 1;
    }
    stripped += ' ';
  }
  return stripped;
};

const isQueryOnlyDocument = (document: string): boolean => {
  let depth = 0;
  let opensDefinition = true;
  let queries = 0;
  const tokens =
    withoutStringsAndComments(document).match(/[_A-Za-z][_0-9A-Za-z]*|[{}]/g) ??
    [];
  for (const token of tokens) {
    if (token === '}') {
      depth -= 1;
      if (depth < 0) return false;
      if (depth === 0) opensDefinition = true;
      continue;
    }
    if (token === '{') {
      if (depth === 0 && opensDefinition) queries += 1;
      opensDefinition = false;
      depth += 1;
      continue;
    }
    if (depth > 0 || !opensDefinition) continue;
    opensDefinition = false;
    if (token === 'fragment') continue;
    if (token !== 'query') return false;
    queries += 1;
  }
  return depth === 0 && queries > 0;
};

const contentRequestSchema = z.discriminatedUnion('op', [
  z.object({ op: z.literal('list'), collection: z.string() }),
  z.object({ op: z.literal('get'), collection: z.string(), path: z.string() }),
  z.object({
    op: z.literal('update'),
    collection: z.string(),
    path: z.string(),
    value: z.record(z.string(), z.unknown()),
  }),
  z.object({
    op: z.literal('graphql'),
    query: z.string().refine(isQueryOnlyDocument, {
      message: 'The content endpoint serves GraphQL queries only.',
    }),
    variables: z.record(z.string(), z.unknown()).optional(),
  }),
]);

export type ContentRequest = z.infer<typeof contentRequestSchema>;

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
