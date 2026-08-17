import { it, expect } from 'vitest';
import config from './tina/config';
import { setupMutation, format } from '../util';

const renameAuthorMutation = `
  mutation {
    updateDocument(
      collection: "author"
      relativePath: "bob-northwind.md"
      params: {
        relativePath: "robert-northwind.md"
      }
    ) {
      ... on Document {
        _sys {
          filename
          relativePath
        }
      }
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

it('renames referenced author and updates references in posts', async () => {
  const { query, bridge } = await setupMutation(__dirname, config);

  // Verify the reference resolves before rename
  const beforeResult = await query({
    query: postWithRefQuery,
    variables: {},
  });
  expect(beforeResult.errors).toBeUndefined();
  expect(beforeResult.data?.post?.author?.name).toBe('Mr Bob Northwind');

  // Rename the author
  const renameResult = await query({
    query: renameAuthorMutation,
    variables: {},
  });

  await expect(format(renameResult)).toMatchFileSnapshot(
    'renameAuthor-response.json'
  );
  expect(renameResult.errors).toBeUndefined();

  // Verify old path was deleted and new path was written
  expect(bridge.getDeletes()).toContain('authors/bob-northwind.md');
  expect(bridge.getWrite('authors/robert-northwind.md')).toBeDefined();

  // Verify the referring post's reference was updated to the new path
  const postWrite = bridge.getWrite('posts/post-with-ref.md');
  expect(postWrite).toBeDefined();
  expect(postWrite).toContain('authors/robert-northwind.md');
  expect(postWrite).not.toContain('authors/bob-northwind.md');
});

it('does not affect posts without references to the renamed author', async () => {
  const { query, bridge } = await setupMutation(__dirname, config);

  // Rename the author
  await query({
    query: renameAuthorMutation,
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
