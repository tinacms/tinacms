import { it, expect } from 'vitest';
import config from './tina/config';
import { setupMutation, format } from '../util';

const deleteAuthorMutation = `
  mutation {
    deleteDocument(
      collection: "author"
      relativePath: "bob-northwind.md"
    ) {
      __typename
    }
  }
`;

const postWithRefQuery = `
  query {
    post(relativePath: "post-with-ref.md") {
      title
      author {
        ... on Author {
          name
        }
      }
    }
  }
`;

const postWithoutRefQuery = `
  query {
    post(relativePath: "post-without-ref.md") {
      title
      content
    }
  }
`;

it('deletes referenced author and nullifies references in posts', async () => {
  const { query, bridge } = await setupMutation(__dirname, config);

  // Verify the reference resolves before deletion
  const beforeResult = await query({
    query: postWithRefQuery,
    variables: {},
  });
  expect(beforeResult.errors).toBeUndefined();
  expect(beforeResult.data?.post?.author?.name).toBe('Mr Bob Northwind');

  // Delete the referenced author
  const deleteResult = await query({
    query: deleteAuthorMutation,
    variables: {},
  });

  await expect(format(deleteResult)).toMatchFileSnapshot(
    'deleteAuthor-response.json'
  );
  expect(deleteResult.errors).toBeUndefined();
  expect(bridge.getDeletes()).toContain('authors/bob-northwind.md');

  // Verify the referring post's reference was nullified via bridge write
  const postWrite = bridge.getWrite('posts/post-with-ref.md');
  expect(postWrite).toBeDefined();
  expect(postWrite).not.toContain('authors/bob-northwind.md');
});

it('does not affect posts without references to the deleted author', async () => {
  const { query, bridge } = await setupMutation(__dirname, config);

  // Delete the author
  await query({
    query: deleteAuthorMutation,
    variables: {},
  });

  // Post without a reference should not have been written
  const unrelatedPostWrite = bridge.getWrite('posts/post-without-ref.md');
  expect(unrelatedPostWrite).toBeUndefined();

  // Post without reference should still be queryable and unchanged
  const result = await query({
    query: postWithoutRefQuery,
    variables: {},
  });
  expect(result.errors).toBeUndefined();
  expect(result.data?.post?.title).toBe('Post Without Reference');
});
