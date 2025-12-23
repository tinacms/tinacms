import { it, expect } from 'vitest';
import config from './tina/config';
import { setupMutation, format } from '../util';

const validCreateMutation = `
  mutation {
    addPendingDocument(
      collection: "post"
      relativePath: "valid-post.md"
    ) {
      __typename
    }
  }
`;

const invalidCollectionMutation = `
  mutation {
    addPendingDocument(
      collection: "nonexistent"
      relativePath: "test.md"
    ) {
      __typename
    }
  }
`;

it('creates pending document with valid parameters', async () => {
  const { query, bridge } = await setupMutation(__dirname, config);

  const result = await query({ query: validCreateMutation, variables: {} });
  await expect(format(result)).toMatchFileSnapshot(
    'addPendingDocument-success-response.json'
  );

  const newDocWrite = bridge.getWrite('posts/valid-post.md');
  await expect(newDocWrite).toBeDefined();
  await expect(newDocWrite).toMatchFileSnapshot('valid-post-content.md');
});

it('handles validation error for invalid collection', async () => {
  const { query } = await setupMutation(__dirname, config);

  const result = await query({
    query: invalidCollectionMutation,
    variables: {},
  });

  expect(result.errors).toBeDefined();
  expect(result.errors?.length).toBeGreaterThan(0);
});

it('handles validation error for invalid path format', async () => {
  const { query } = await setupMutation(__dirname, config);

  const invalidPathMutation = `
    mutation {
      addPendingDocument(
        collection: "post"
        relativePath: "../invalid-path.md"
      ) {
        __typename
      }
    }
  `;

  const result = await query({ query: invalidPathMutation, variables: {} });

  expect(result.errors).toBeDefined();
  expect(result.errors?.length).toBeGreaterThan(0);
});
