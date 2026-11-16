import { z } from 'zod';
import {
  TINACLOUD_CONTENT_URL,
  type TinaCloudClient,
  TinaCloudError,
} from '../client';

// The wire contract for v4 content is not final on the TinaCloud side. It lives
// in this file alone, so a change to it touches only here and its test.
export const TINACLOUD_CONTENT_API_VERSION = '4.0';

export const LIST_PAGE_SIZE = 50;

const graphQLErrorSchema = z.object({
  message: z.string(),
  extensions: z
    .object({ code: z.string().optional(), field: z.string().optional() })
    .optional(),
});

export type TinaCloudGraphQLErrorEntry = z.infer<typeof graphQLErrorSchema>;

const responseSchema = z.object({
  data: z.unknown().optional(),
  errors: z.array(graphQLErrorSchema).optional(),
});

export class TinaCloudGraphQLError extends TinaCloudError {
  readonly errors: TinaCloudGraphQLErrorEntry[];

  constructor(errors: TinaCloudGraphQLErrorEntry[], body: unknown) {
    super(errors.map((error) => error.message).join(' '), { body });
    this.name = 'TinaCloudGraphQLError';
    this.errors = errors;
  }
}

export const contentUrl = (clientId: string, branch: string): string =>
  `${TINACLOUD_CONTENT_URL}/${TINACLOUD_CONTENT_API_VERSION}/content/${clientId}/github/${encodeURIComponent(branch)}`;

const requestGraphQL = async <Data>(
  client: TinaCloudClient,
  branch: string,
  schema: z.ZodType<Data>,
  query: string,
  variables: Record<string, unknown>
): Promise<Data> => {
  const body = await client.authedFetch(contentUrl(client.clientId, branch), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const response = responseSchema.safeParse(body);
  if (!response.success) {
    throw new TinaCloudError(
      'TinaCloud returned a content response in an unknown format.',
      { body }
    );
  }
  const { errors } = response.data;
  if (errors && errors.length > 0) {
    throw new TinaCloudGraphQLError(errors, body);
  }
  const data = schema.safeParse(response.data.data);
  if (!data.success) {
    throw new TinaCloudError(
      `TinaCloud returned content data in an unknown format: ${data.error.message}`,
      { body }
    );
  }
  return data.data;
};

const documentSchema = z.object({
  _sys: z.object({ path: z.string() }),
  _values: z.record(z.unknown()),
});

const DOCUMENT_QUERY = `query($collection: String!, $path: String!) {
  document(collection: $collection, path: $path) { _sys { path } _values }
}`;

export const fetchDocument = async (
  client: TinaCloudClient,
  branch: string,
  collection: string,
  path: string
) =>
  (
    await requestGraphQL(
      client,
      branch,
      z.object({ document: documentSchema.nullable() }),
      DOCUMENT_QUERY,
      { collection, path }
    )
  ).document;

const listPageSchema = z.object({
  collection: z.object({
    documents: z.object({
      edges: z.array(
        z.object({ node: z.object({ _sys: z.object({ path: z.string() }) }) })
      ),
      pageInfo: z.object({
        hasNextPage: z.boolean(),
        endCursor: z.string().nullable(),
      }),
    }),
  }),
});

const LIST_QUERY = `query($collection: String!, $first: Float!, $after: String) {
  collection(collection: $collection) {
    documents(first: $first, after: $after) {
      edges { node { ... on Document { _sys { path } } } }
      pageInfo { hasNextPage endCursor }
    }
  }
}`;

export const fetchDocumentPage = async (
  client: TinaCloudClient,
  branch: string,
  collection: string,
  after: string | null
) =>
  (
    await requestGraphQL(client, branch, listPageSchema, LIST_QUERY, {
      collection,
      first: LIST_PAGE_SIZE,
      after,
    })
  ).collection.documents;

const UPDATE_MUTATION = `mutation($collection: String!, $path: String!, $params: JSON!) {
  updateDocument(collection: $collection, path: $path, params: $params) { _sys { path } _values }
}`;

export const updateDocument = async (
  client: TinaCloudClient,
  branch: string,
  collection: string,
  path: string,
  params: Record<string, unknown>
) =>
  (
    await requestGraphQL(
      client,
      branch,
      z.object({ updateDocument: documentSchema }),
      UPDATE_MUTATION,
      { collection, path, params }
    )
  ).updateDocument;
