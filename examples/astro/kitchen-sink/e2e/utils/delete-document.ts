import { existsSync } from 'fs';
import { resolve } from 'path';
import type { APIRequestContext } from '@playwright/test';

const DELETE_DOCUMENT = `
  mutation DeleteDocument($collection: String!, $relativePath: String!) {
    deleteDocument(collection: $collection, relativePath: $relativePath) {
      __typename
    }
  }
`;

/** Maps collection names to their content directory paths (relative to project root). */
const COLLECTION_PATHS: Record<string, string> = {
  author: 'content/authors',
  post: 'content/posts',
  blog: 'content/blogs',
  page: 'content/pages',
  tag: 'content/tags',
};

/**
 * Delete a document via the `deleteDocument` GraphQL mutation.
 * Checks the filesystem first to avoid noisy server-side error logs
 * when the document doesn't exist (e.g. beforeAll cleanup on clean runs).
 */
export const deleteDocument = async (
  apiContext: APIRequestContext,
  collection: string,
  relativePath: string
): Promise<void> => {
  // Check if the file exists on disk before sending the mutation.
  // This prevents the TinaCMS dev server from logging "Unable to delete" errors.
  const dir = COLLECTION_PATHS[collection];
  if (dir) {
    const filePath = resolve(dir, relativePath);
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
