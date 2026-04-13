import type { APIRequestContext } from '@playwright/test';

/**
 * Serialise a value into a GraphQL inline literal.
 * Handles strings, numbers, booleans, arrays, and nested objects.
 */
function toGraphQLValue(value: unknown): string {
  if (typeof value === 'string')
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  if (Array.isArray(value)) return `[${value.map(toGraphQLValue).join(', ')}]`;
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value)
      .map(([k, v]) => `${k}: ${toGraphQLValue(v)}`)
      .join(', ');
    return `{ ${entries} }`;
  }
  return 'null';
}

/**
 * Create a document via the generic `createDocument` GraphQL mutation.
 *
 * For single-template collections (author, post, blog, page) the params
 * structure is:  `{ <collectionName>: { field1: value1, ... } }`
 *
 * @example
 *   await createDocument(apiContext, 'author', 'e2e-author.md', {
 *     name: 'E2E Author',
 *     description: 'Created by Playwright',
 *   });
 */
export const createDocument = async (
  apiContext: APIRequestContext,
  collection: string,
  relativePath: string,
  fields: Record<string, unknown>
): Promise<void> => {
  const fieldLiteral = Object.entries(fields)
    .map(([key, value]) => `${key}: ${toGraphQLValue(value)}`)
    .join(', ');

  const query = `
    mutation {
      createDocument(
        collection: "${collection}"
        relativePath: "${relativePath}"
        params: {
          ${collection}: {
            ${fieldLiteral}
          }
        }
      ) {
        __typename
      }
    }
  `;

  const resp = await apiContext.post('/graphql', {
    data: { query },
  });

  if (!resp.ok()) {
    const body = await resp.text();
    throw new Error(
      `GraphQL createDocument failed (${collection}/${relativePath}): ${resp.status()} ${body}`
    );
  }

  const json = await resp.json();
  if (json.errors?.length) {
    throw new Error(
      `GraphQL createDocument errors: ${JSON.stringify(json.errors)}`
    );
  }
};
