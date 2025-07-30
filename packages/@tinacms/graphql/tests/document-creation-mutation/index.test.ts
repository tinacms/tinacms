import { it, expect } from 'vitest';
import config from './tina/config';
import { setupMutation, format } from '../util';

const createMutation = `
  mutation {
    createDocument(
      collection: "post"
      relativePath: "comprehensive-post.md"
      params: {
        post: {
          title: "Comprehensive Test Post by Mr Bob Northwind"
          content: {
            type: "root"
            children: [
              {
                type: "p"
                children: [
                  {
                    type: "text"
                    text: "This is a comprehensive test post created by Mr Bob Northwind for his Northwind company."
                  }
                ]
              }
            ]
          }
          author: "Mr Bob Northwind"
          published: true
          rating: 10
          publishDate: "2023-12-01T00:00:00.000Z"
          category: "business"
          featuredImage: "/images/northwind-featured.jpg"
          tags: ["test", "comprehensive", "northwind"]
          metadata: {
            seoTitle: "Comprehensive Test Post - Northwind"
            seoDescription: "A comprehensive test post demonstrating all field types"
          }
          authors: [
            {
              name: "Mr Bob Northwind"
              bio: "CEO of Northwind company"
            }
          ]
        }
      }
    ) {
      __typename
    }
  }
`;

it('creates document with all field types and validates bridge writes', async () => {
  const { get, bridge } = await setupMutation(__dirname, config);

  const result = await get({
    query: createMutation,
    variables: {},
  });
  expect(format(result)).toMatchFileSnapshot('createDocument-response.json');

  const newDocWrite = bridge.getWrite('posts/comprehensive-post.md');
  expect(newDocWrite).toBeDefined();
  expect(newDocWrite).toMatchFileSnapshot('comprehensive-post-content.md');
});

it('validates immediate document availability after creation', async () => {
  const { get } = await setupMutation(__dirname, config);

  await get({
    query: createMutation,
    variables: {},
  });

  const getQuery = `
    query {
      post(relativePath: "comprehensive-post.md") {
        title
        content
        author
        published
        rating
        publishDate
        category
        featuredImage
        tags
        metadata {
          seoTitle
          seoDescription
        }
        authors {
          name
          bio
        }
      }
    }
  `;

  const queryResult = await get({
    query: getQuery,
    variables: {},
  });

  expect(format(queryResult)).toMatchFileSnapshot('getDocument-response.json');
});
