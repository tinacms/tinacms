import { it, expect } from 'vitest';
import config from './tina/config';
import { setupMutation, format } from '../util';

const createMutation = `
  mutation {
    createDocument(
      collection: "post"
      relativePath: "post-with-reference.md"
      params: {
        post: {
          title: "Test Post with Reference by Mr Bob Northwind"
          content: "This is a test post created by Mr Bob Northwind for his Northwind company."
          author: "authors/bob-northwind.md"
        }
      }
    ) {
      __typename
    }
  }
`;

it('creates document with reference field without errors', async () => {
  const { query, bridge } = await setupMutation(__dirname, config);

  const result = await query({
    query: createMutation,
    variables: {},
  });

  await expect(format(result)).toMatchFileSnapshot(
    'createDocument-response.json'
  );

  const newDocWrite = bridge.getWrite('posts/post-with-reference.md');
  await expect(newDocWrite).toBeDefined();
  await expect(newDocWrite).toContain('author: authors/bob-northwind.md');
});

it('validates document with reference field is queryable after creation', async () => {
  const { query } = await setupMutation(__dirname, config);

  await query({
    query: createMutation,
    variables: {},
  });

  const getQuery = `
    query {
      post(relativePath: "post-with-reference.md") {
        title
        content
        author {
          ... on Author {
            name
            bio
          }
        }
      }
    }
  `;

  const queryResult = await query({
    query: getQuery,
    variables: {},
  });

  expect(queryResult.errors).toBeUndefined();
  expect(queryResult.data?.post?.title).toBe(
    'Test Post with Reference by Mr Bob Northwind'
  );
  expect(queryResult.data?.post?.author?.name).toBe('Mr Bob Northwind');
  expect(queryResult.data?.post?.author?.bio).toBe(
    'CEO of Northwind company and expert business writer'
  );
});
