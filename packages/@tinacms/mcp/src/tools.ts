import { z } from 'zod';
import { TinaClient, TinaGraphQLError } from './client';

const SYS_FIELDS = `_sys { relativePath title template }`;

export interface ToolResult {
  [key: string]: unknown;
  content: { type: 'text'; text: string }[];
  isError?: boolean;
}

export interface ToolDefinition<Shape extends z.ZodRawShape = z.ZodRawShape> {
  name: string;
  title: string;
  description: string;
  inputSchema: Shape;
  readOnly: boolean;
  handler: (
    args: z.objectOutputType<Shape, z.ZodTypeAny>
  ) => Promise<ToolResult>;
}

class UsageError extends Error {}

const ok = (value: unknown): ToolResult => ({
  content: [{ type: 'text', text: JSON.stringify(value, null, 2) }],
});

const fail = (error: unknown): ToolResult => {
  if (error instanceof UsageError) {
    return {
      isError: true,
      content: [{ type: 'text', text: error.message }],
    };
  }
  if (error instanceof TinaGraphQLError) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Tina error: ${error.message}` }],
    };
  }
  if (error instanceof Error) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Request failed: ${error.message}` }],
    };
  }
  throw error;
};

const collectionArg = z
  .string()
  .describe('Collection name, as returned by list_collections');
const pathArg = z
  .string()
  .describe(
    'Path of the document relative to the collection, e.g. "hello-world.mdx"'
  );
const templateArg = z
  .string()
  .optional()
  .describe(
    'Template name. Required for collections that define templates (see list_collections), not allowed otherwise.'
  );
const valuesArg = z
  .record(z.unknown())
  .describe(
    'Field values keyed by field name. Use list_collections to see the fields and their types.'
  );

type FieldSummary = {
  name: string;
  type: string;
  label?: string;
  required?: boolean;
  list?: boolean;
  options?: unknown[];
  fields?: FieldSummary[];
  templates?: { name: string; fields: FieldSummary[] }[];
};

interface RawField {
  name: string;
  type: string;
  label?: string;
  required?: boolean;
  list?: boolean;
  options?: unknown[];
  fields?: RawField[];
  templates?: { name: string; fields?: RawField[] }[];
}

const summarizeFields = (fields: RawField[] = []): FieldSummary[] =>
  fields.map((field) => {
    const summary: FieldSummary = { name: field.name, type: field.type };
    if (field.label) summary.label = field.label;
    if (field.required) summary.required = true;
    if (field.list) summary.list = true;
    if (field.options) summary.options = field.options;
    if (Array.isArray(field.fields)) {
      summary.fields = summarizeFields(field.fields);
    }
    if (Array.isArray(field.templates)) {
      summary.templates = field.templates.map((template) => ({
        name: template.name,
        fields: summarizeFields(template.fields),
      }));
    }
    return summary;
  });

const stripSystemKeys = (values: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(values).filter(([key]) => !key.startsWith('_'))
  );

/**
 * Mutation params are keyed by collection, and for a collection that defines
 * `templates` they are keyed once more by template name.
 */
const buildParams = async (
  client: TinaClient,
  collection: string,
  template: string | undefined,
  values: Record<string, unknown>,
  { templateIsFromDocument = false } = {}
) => {
  const data = await client.request<{
    collection: { templates: { name: string }[] | null };
  }>(
    `query ($collection: String) { collection(collection: $collection) { templates } }`,
    { collection }
  );
  const templates = data.collection.templates;
  if (!templates) {
    if (template && !templateIsFromDocument) {
      throw new UsageError(
        `Collection "${collection}" has no templates, so \`template\` must be left out`
      );
    }
    return { [collection]: values };
  }
  const names = templates.map((t) => t.name);
  if (!template || !names.includes(template)) {
    throw new UsageError(
      `Collection "${collection}" has several templates (${names.join(', ')}); pass one as \`template\``
    );
  }
  return { [collection]: { [template]: values } };
};

interface DocumentNode {
  _sys: { relativePath: string; title: string | null; template: string };
  _values: Record<string, unknown>;
}

export const readTools = (client: TinaClient): ToolDefinition[] => [
  {
    name: 'list_collections',
    title: 'List collections',
    description:
      'List the content collections defined in the TinaCMS schema, with their fields and field types.',
    inputSchema: {},
    readOnly: true,
    handler: async () => {
      try {
        const data = await client.request<{
          collections: {
            name: string;
            label: string | null;
            path: string;
            format: string | null;
            fields: RawField[] | null;
            templates: { name: string; fields?: RawField[] }[] | null;
          }[];
        }>(`query { collections { name label path format fields templates } }`);
        return ok(
          data.collections.map((collection) => ({
            name: collection.name,
            label: collection.label,
            path: collection.path,
            format: collection.format,
            ...(collection.fields
              ? { fields: summarizeFields(collection.fields) }
              : {}),
            ...(collection.templates
              ? {
                  templates: collection.templates.map((template) => ({
                    name: template.name,
                    fields: summarizeFields(template.fields),
                  })),
                }
              : {}),
          }))
        );
      } catch (error) {
        return fail(error);
      }
    },
  },
  {
    name: 'list_documents',
    title: 'List documents',
    description:
      'List the documents in a collection, one page at a time. Pass the returned endCursor as `after` to get the next page.',
    inputSchema: {
      collection: collectionArg,
      first: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe('Page size, default 20'),
      after: z
        .string()
        .optional()
        .describe('Cursor from a previous call (pageInfo.endCursor)'),
      folder: z
        .string()
        .optional()
        .describe(
          'Only list documents inside this sub-folder of the collection'
        ),
    },
    readOnly: true,
    handler: async ({ collection, first, after, folder }) => {
      try {
        const data = await client.request<{
          collection: {
            documents: {
              totalCount: number;
              pageInfo: { hasNextPage: boolean; endCursor: string | null };
              edges: { node: Partial<DocumentNode> }[];
            };
          };
        }>(
          `query ($collection: String, $first: Float, $after: String, $folder: String) {
            collection(collection: $collection) {
              documents(first: $first, after: $after, folder: $folder) {
                totalCount
                pageInfo { hasNextPage endCursor }
                edges { node { ... on Document { ${SYS_FIELDS} } } }
              }
            }
          }`,
          { collection, first: first ?? 20, after, folder }
        );
        const { documents } = data.collection;
        return ok({
          totalCount: documents.totalCount,
          pageInfo: documents.pageInfo,
          documents: documents.edges
            .map((edge) => edge.node._sys)
            .filter(Boolean),
        });
      } catch (error) {
        return fail(error);
      }
    },
  },
  {
    name: 'get_document',
    title: 'Get document',
    description: 'Read one document, returning its field values.',
    inputSchema: { collection: collectionArg, relativePath: pathArg },
    readOnly: true,
    handler: async ({ collection, relativePath }) => {
      try {
        const data = await client.request<{ document: DocumentNode }>(
          `query ($collection: String, $relativePath: String) {
            document(collection: $collection, relativePath: $relativePath) {
              ... on Document { ${SYS_FIELDS} _values }
            }
          }`,
          { collection, relativePath }
        );
        return ok({ ...data.document._sys, values: data.document._values });
      } catch (error) {
        return fail(error);
      }
    },
  },
];

export const writeTools = (client: TinaClient): ToolDefinition[] => [
  {
    name: 'create_document',
    title: 'Create document',
    description:
      'Create a new document. Fails if the document already exists or the values do not match the collection schema; nothing is written in that case.',
    inputSchema: {
      collection: collectionArg,
      relativePath: pathArg,
      template: templateArg,
      values: valuesArg,
    },
    readOnly: false,
    handler: async ({ collection, relativePath, template, values }) => {
      try {
        const params = await buildParams(client, collection, template, values);
        const data = await client.request<{ createDocument: DocumentNode }>(
          `mutation ($collection: String, $relativePath: String!, $params: DocumentMutation!) {
            createDocument(collection: $collection, relativePath: $relativePath, params: $params) {
              ... on Document { ${SYS_FIELDS} _values }
            }
          }`,
          { collection, relativePath, params }
        );
        return ok({
          ...data.createDocument._sys,
          values: data.createDocument._values,
        });
      } catch (error) {
        return fail(error);
      }
    },
  },
  {
    name: 'update_document',
    title: 'Update document',
    description:
      'Change fields of an existing document. Only the fields passed in `values` change; the others keep their current value. Fails, and writes nothing, if the result does not match the collection schema.',
    inputSchema: {
      collection: collectionArg,
      relativePath: pathArg,
      values: valuesArg,
    },
    readOnly: false,
    handler: async ({ collection, relativePath, values }) => {
      try {
        const current = await client.request<{ document: DocumentNode }>(
          `query ($collection: String, $relativePath: String) {
            document(collection: $collection, relativePath: $relativePath) {
              ... on Document { ${SYS_FIELDS} _values }
            }
          }`,
          { collection, relativePath }
        );
        const params = await buildParams(
          client,
          collection,
          current.document._sys.template,
          { ...stripSystemKeys(current.document._values), ...values },
          { templateIsFromDocument: true }
        );
        const data = await client.request<{ updateDocument: DocumentNode }>(
          `mutation ($collection: String, $relativePath: String!, $params: DocumentUpdateMutation!) {
            updateDocument(collection: $collection, relativePath: $relativePath, params: $params) {
              ... on Document { ${SYS_FIELDS} _values }
            }
          }`,
          { collection, relativePath, params }
        );
        return ok({
          ...data.updateDocument._sys,
          values: data.updateDocument._values,
        });
      } catch (error) {
        return fail(error);
      }
    },
  },
];
