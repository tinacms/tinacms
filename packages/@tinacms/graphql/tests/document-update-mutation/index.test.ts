import { it, expect } from 'vitest';
import config from './tina/config';
import { setupMutation, format } from '../util';

const updateMutation = `
  mutation {
    updateDocument(
      collection: "post", 
      relativePath: "in.md", 
      params: {
        post: {
          title: "Updated Title by Mr Bob Northwind"
          genre: "action"
          rating: 9
          body: {
            type: "root"
            children: [
              {
                type: "p"
                children: [
                  {
                    type: "text"
                    text: "This is the updated content for Mr Bob Northwind's post about Northwind. The company has achieved remarkable success through innovation and customer focus."
                  }
                ]
              }
            ]
          }
        }
      }
    ) {
      ...on Document { _values, _sys { title } }
    }
  }
`;

it('updates document and validates bridge writes', async () => {
  const { query, bridge } = await setupMutation(__dirname, config);

  // Execute mutation with inline parameters (no variables)
  const result = await query({
    query: updateMutation,
    variables: {},
  });

  // Validate GraphQL response
  expect(format(result)).toMatchFileSnapshot('update-document-node.json');

  // Validate Bridge write operations
  const writes = bridge.getWrites();
  expect(writes.size).toBeGreaterThan(0);
  expect(bridge.getWrite('posts/in.md')).toMatchFileSnapshot(
    'update-document-content.md'
  );
});

const updatePostMutation = `
  mutation {
    updatePost(
      relativePath: "in.md", 
      params: {
        title: "Updated Title by Mr Bob Northwind via updatePost"
        genre: "thriller"
        rating: 8
        body: {
          type: "root"
          children: [
            {
              type: "p"
              children: [
                {
                  type: "text"
                  text: "This is the updated content for Mr Bob Northwind's post about Northwind via updatePost. The company continues to thrive under his leadership."
                }
              ]
            }
          ]
        }
      }
    ) {
      _values
      _sys { title }
    }
  }
`;

it('updates document using updatePost mutation', async () => {
  const { query, bridge } = await setupMutation(__dirname, config);

  // Execute updatePost mutation
  const result = await query({
    query: updatePostMutation,
    variables: {},
  });

  // Validate GraphQL response
  expect(format(result)).toMatchFileSnapshot('update-post-node.json');

  // Validate Bridge write operations
  const writes = bridge.getWrites();
  expect(writes.size).toBeGreaterThan(0);
  expect(bridge.getWrite('posts/in.md')).toMatchFileSnapshot(
    'update-post-content.md'
  );
});
