import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { resolve } from 'path';
import type { APIRequestContext } from '@playwright/test';

const DELETE_DOCUMENT = `
  mutation DeleteDocument($collection: String!, $relativePath: String!) {
    deleteDocument(collection: $collection, relativePath: $relativePath) {
      __typename
    }
  }
`;

const SHARED_CONTENT_ROOT = fileURLToPath(
  new URL('../../../../shared/content/', import.meta.url)
);

/** Maps collection names to their content directory paths under examples/shared/content. */
const COLLECTION_PATHS: Record<string, string> = {
  author: 'authors',
  post: 'posts',
  blog: 'blogs',
  page: 'pages',
  tag: 'tags',
};

/**
 * Delete a document via the `deleteDocument` GraphQL mutation.
 * Checks the filesystem first to avoid noisy server-side error logs.
 */
export const deleteDocument = async (
  apiContext: APIRequestContext,
  collection: string,
  relativePath: string
): Promise<void> => {
  const dir = COLLECTION_PATHS[collection];
  if (dir) {
    const filePath = resolve(SHARED_CONTENT_ROOT, dir, relativePath);
    if (!existsSync(filePath)) return;
  }

  const resp = await apiContext.post('/graphql', {
    data: {
      query: DELETE_DOCUMENT,
      variables: { collection, relativePath },
    },
  });

  if (!resp.ok()) {
    throw new Error(
      `GraphQL delete failed: ${resp.status()} ${await resp.text()}`
    );
  }
};
