import { z } from 'zod';
import {
  CONTENT_CREATE_PERMISSION,
  CONTENT_DELETE_PERMISSION,
  CONTENT_RENAME_PERMISSION,
  CONTENT_SAVE_PERMISSION,
  InvalidSaveInputError,
  type ListQuery,
} from '../../../../core/content/contract';
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

const listQuerySchema = z
  .object({
    folder: z.string().optional(),
    filter: z.string().optional(),
    sort: z
      .object({
        by: z.enum(['title', 'updatedAt']),
        direction: z.enum(['asc', 'desc']),
      })
      .optional(),
    first: z.number().optional(),
    after: z.string().optional(),
  })
  .optional();

const document = z.record(z.string(), z.unknown());

const contentRequestSchema = z.discriminatedUnion('op', [
  z.object({
    op: z.literal('list'),
    collection: z.string(),
    query: listQuerySchema,
  }),
  z.object({ op: z.literal('get'), collection: z.string(), path: z.string() }),
  z.object({
    op: z.literal('update'),
    collection: z.string(),
    path: z.string(),
    value: document,
  }),
  z.object({
    op: z.literal('create'),
    collection: z.string(),
    path: z.string(),
    value: document,
    template: z.string().optional(),
  }),
  z.object({
    op: z.literal('rename'),
    collection: z.string(),
    from: z.string(),
    to: z.string(),
  }),
  z.object({
    op: z.literal('delete'),
    collection: z.string(),
    path: z.string(),
  }),
  z.object({
    op: z.literal('referrers'),
    collection: z.string(),
    path: z.string(),
  }),
  z.object({
    op: z.literal('createFolder'),
    collection: z.string(),
    folder: z.string(),
  }),
  z.object({
    op: z.literal('renameFolder'),
    collection: z.string(),
    from: z.string(),
    to: z.string(),
  }),
  z.object({
    op: z.literal('deleteFolder'),
    collection: z.string(),
    folder: z.string(),
  }),
  z.object({
    op: z.literal('graphql'),
    query: z.string().refine(isQueryOnlyDocument, {
      message: 'The content endpoint serves GraphQL queries only.',
    }),
    variables: z.record(z.string(), z.unknown()).optional(),
  }),
]);

const listQueryOf = (
  query: z.infer<typeof listQuerySchema>
): ListQuery | undefined => {
  if (!query) return undefined;
  const { sort, ...rest } = query;
  if (!sort) return rest;
  return { ...rest, sort: { by: sort.by, direction: sort.direction } };
};

export type ContentRequest = z.infer<typeof contentRequestSchema>;

/**
 * The permission an operation needs beyond a session. An `update` to a path with
 * no file also needs `content:create`; the endpoint asks for that separately.
 */
export const permissionForOp = (
  op: ContentRequest['op']
): string | undefined => {
  switch (op) {
    case 'update':
      return CONTENT_SAVE_PERMISSION;
    case 'create':
    case 'createFolder':
      return CONTENT_CREATE_PERMISSION;
    case 'rename':
    case 'renameFolder':
      return CONTENT_RENAME_PERMISSION;
    case 'delete':
    case 'deleteFolder':
      return CONTENT_DELETE_PERMISSION;
    case 'list':
    case 'get':
    case 'referrers':
    case 'graphql':
      return undefined;
  }
};

export const parseContentRequest = (request: unknown): ContentRequest => {
  const parsed = contentRequestSchema.safeParse(request);
  if (!parsed.success) {
    const [issue] = parsed.error.issues;
    throw new InvalidSaveInputError(
      `The content request is not valid: ${issue?.message ?? 'unknown'}.`
    );
  }
  return parsed.data;
};

export interface DispatchOptions {
  /** Whether an `update` to a path with no file may create it. */
  mayCreate?: boolean;
}

/** Runs a request against the Data Layer. Void operations answer `null`. */
export const dispatchContentRequest = async (
  provider: LocalDataLayer,
  request: unknown,
  dispatchOptions: DispatchOptions = {}
): Promise<unknown> => {
  const parsed = parseContentRequest(request);
  switch (parsed.op) {
    case 'list':
      return provider.list(parsed.collection, listQueryOf(parsed.query));
    case 'get':
      return provider.get(parsed.collection, parsed.path);
    case 'update':
      return provider.update(parsed.collection, parsed.path, parsed.value, {
        mayCreate: dispatchOptions.mayCreate,
      });
    case 'create':
      return provider.create(
        parsed.collection,
        parsed.path,
        parsed.value,
        parsed.template
      );
    case 'rename':
      return provider.rename(parsed.collection, parsed.from, parsed.to);
    case 'delete':
      await provider.delete(parsed.collection, parsed.path);
      return null;
    case 'referrers':
      return provider.referrers(parsed.collection, parsed.path);
    case 'createFolder':
      return provider.createFolder(parsed.collection, parsed.folder);
    case 'renameFolder':
      return provider.renameFolder(parsed.collection, parsed.from, parsed.to);
    case 'deleteFolder':
      return provider.deleteFolder(parsed.collection, parsed.folder);
    case 'graphql':
      return provider.graphql(parsed.query, parsed.variables);
  }
};
