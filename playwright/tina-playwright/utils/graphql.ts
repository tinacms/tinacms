import { APIRequestContext } from "@playwright/test";

// Typed so typos surface at compile time rather than as a runtime error.
// Kept in sync with tina/collections/*.js.
export type CollectionName = "post" | "author" | "page" | "settings";

// Shared GraphQL mutation strings and helpers — used by every spec that
// needs to create, update, or delete content.

export const CREATE_DOCUMENT = `
  mutation CreateDocument($collection: String!, $relativePath: String!, $params: DocumentMutation!) {
    createDocument(collection: $collection, relativePath: $relativePath, params: $params) {
      __typename
    }
  }
`;

export const UPDATE_DOCUMENT = `
  mutation UpdateDocument($collection: String!, $relativePath: String!, $params: DocumentUpdateMutation!) {
    updateDocument(collection: $collection, relativePath: $relativePath, params: $params) {
      __typename
    }
  }
`;

export const DELETE_DOCUMENT = `
  mutation DeleteDocument($collection: String!, $relativePath: String!) {
    deleteDocument(collection: $collection, relativePath: $relativePath) {
      __typename
    }
  }
`;

type GqlResponse<T = unknown> = {
  data?: T;
  errors?: Array<{ message: string; [key: string]: unknown }>;
};

type MutationArgs = {
  collection: CollectionName;
  relativePath: string;
  params?: Record<string, unknown>;
};

export async function gqlRequest<T = unknown>(
  apiContext: APIRequestContext,
  query: string,
  variables: Record<string, unknown>
): Promise<GqlResponse<T>> {
  const resp = await apiContext.post("/graphql", {
    data: { query, variables },
  });
  return (await resp.json()) as GqlResponse<T>;
}

export function createDocument(
  apiContext: APIRequestContext,
  { collection, relativePath, params }: MutationArgs
) {
  return gqlRequest(apiContext, CREATE_DOCUMENT, {
    collection,
    relativePath,
    params,
  });
}

export function updateDocument(
  apiContext: APIRequestContext,
  { collection, relativePath, params }: MutationArgs
) {
  return gqlRequest(apiContext, UPDATE_DOCUMENT, {
    collection,
    relativePath,
    params,
  });
}

export function deleteDocument(
  apiContext: APIRequestContext,
  { collection, relativePath }: Omit<MutationArgs, "params">
) {
  return gqlRequest(apiContext, DELETE_DOCUMENT, { collection, relativePath });
}
