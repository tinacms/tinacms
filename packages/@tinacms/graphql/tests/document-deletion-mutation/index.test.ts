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

const postWithRefQuery = `
  query {
    post(relativePath: "post-with-ref.md") {
      title
      author {
        ... on Author {
          name
          bio
        }
      }
    }
  }
`;

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

it('deletes document and removes it from queries', async () => {
  const { query, bridge } = await setupMutation(__dirname, config);

  const result = await query({
    query: deletePostMutation,
    variables: {},
  });

  expect(format(result)).toMatchFileSnapshot('deleteDocument-response.json');
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

// it('deletes referenced document and cascades null to referencing documents', async () => {
//   const { query, bridge } = await setupMutation(__dirname, config);

//   const initialPostResult = await query({
//     query: postWithRefQuery,
//     variables: {},
//   });

//   expect(initialPostResult.errors).toBeUndefined();
//   expect(initialPostResult.data?.post?.author?.name).toBe(
//     'Mr Bob Northwind'
//   );

//   const deleteResult = await query({
//     query: deleteAuthorMutation,
//     variables: {},
//   });

//   expect(deleteResult.errors).toBeUndefined();
//   expect(bridge.getDeletes()).toContain('authors/bob-northwind.md');
//   expect(bridge.getWrites().has('posts/post-with-ref.md')).toBe(true);

//   const updatedPostResult = await query({
//     query: postWithRefQuery,
//     variables: {},
//   });

//   expect(updatedPostResult.errors).toBeUndefined();
//   expect(updatedPostResult.data?.post?.author).toBeNull();
// });

// it('returns error when deleting non-existent document', async () => {
//   const { query } = await setupMutation(__dirname, config);

//   const result = await query({
//     query: `
//       mutation {
//         deleteDocument(
//           collection: "post"
//           relativePath: "does-not-exist.md"
//         ) {
//           __typename
//         }
//       }
//     `,
//     variables: {},
//   });

//   expect(result.errors).toBeDefined();
// });
