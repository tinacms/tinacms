import { it, expect } from 'vitest';
import config from './tina/config';
import { setupMutation, format } from '../util';

const deletePostMutation = `
  mutation {
    deleteDocument(
      collection: "post"
      relativePath: "post-to-delete.md"
    ) {
      __typename
    }
  }
`;

const postListQuery = `
  query {
    postConnection {
      edges {
        node {
          id
          title
          content
        }
      }
    }
  }
`;

it('deletes document and removes it from queries', async () => {
  const { query, bridge } = await setupMutation(__dirname, config);

  const result = await query({
    query: deletePostMutation,
    variables: {},
  });

  await expect(format(result)).toMatchFileSnapshot(
    'deleteDocument-response.json'
  );
  expect(result.errors).toBeUndefined();
  expect(bridge.getDeletes()).toContain('posts/post-to-delete.md');

  const postListResult = await query({
    query: postListQuery,
    variables: {},
  });

  expect(postListResult.errors).toBeUndefined();
  expect(
    postListResult.data?.postConnection.edges.map(({ node }) => node.id)
  ).not.toContain('posts/post-to-delete.md');
});
