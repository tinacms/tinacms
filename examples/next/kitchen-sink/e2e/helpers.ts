import type { APIRequestContext } from '@playwright/test';
import { expect } from '@playwright/test';

/** POST a GraphQL query to /api/gql with retry for transient errors. Returns parsed body. */
export async function gqlQuery(
  request: APIRequestContext,
  query: string,
  retries = 3
): Promise<any> {
  let lastResponse: any;
  for (let i = 0; i < retries; i++) {
    lastResponse = await request.post('/api/gql', {
      headers: { 'Content-Type': 'application/json' },
      data: { query },
    });
    if (lastResponse.status() === 200) break;
    if (i < retries - 1) await new Promise((r) => setTimeout(r, 3000));
  }
  expect(lastResponse.status()).toBe(200);
  const body = await lastResponse.json();
  if (body.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(body.errors)}`);
  }
  return body;
}
