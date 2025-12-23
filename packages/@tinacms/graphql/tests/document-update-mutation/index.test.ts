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
  await expect(format(result)).toMatchFileSnapshot(
    'expected-snapshots/update-document-node.json'
  );

  // Validate Bridge write operations
  const writes = bridge.getWrites();
  await expect(writes.size).toBeGreaterThan(0);
  await expect(bridge.getWrite('posts/in.md')).toMatchFileSnapshot(
    'expected-snapshots/update-document-content.md'
  );
});

const renameDocumentMutation = `
  mutation {
    updateDocument(
      collection: "post",
      relativePath: "in.md",
      params: {
        relativePath: "renamed-by-bob.md"
      }
    ) {
      ...on Document { _values, _sys { title } }
    }
  }
`;

it('renames document using updateDocument mutation', async () => {
  const { query, bridge } = await setupMutation(__dirname, config);

  // Execute mutation to rename the document
  const result = await query({
    query: renameDocumentMutation,
    variables: {},
  });

  // Validate GraphQL response
  await expect(format(result)).toMatchFileSnapshot(
    'expected-snapshots/rename-document-node.json'
  );

  // Validate Bridge write operations
  const writes = bridge.getWrites();
  await expect(writes.size).toBeGreaterThan(0);
  await expect(bridge.getWrite('posts/renamed-by-bob.md')).toMatchFileSnapshot(
    'expected-snapshots/rename-document-content.md'
  );

  // Validate that original file was deleted
  const deletes = bridge.getDeletes();
  expect(deletes).toContain('posts/in.md');
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
  await expect(format(result)).toMatchFileSnapshot(
    'expected-snapshots/update-post-node.json'
  );

  // Validate Bridge write operations
  const writes = bridge.getWrites();
  await expect(writes.size).toBeGreaterThan(0);
  await expect(bridge.getWrite('posts/in.md')).toMatchFileSnapshot(
    'expected-snapshots/update-post-content.md'
  );
});
