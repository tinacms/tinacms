import { it, expect } from 'vitest';
import config from './tina/config';
import { setupMutation, format } from '../util';

const createFolderMutation = `
  mutation {
    createFolder(
      collection: "post"
      relativePath: "northwind/company-updates"
    ) {
      __typename
    }
  }
`;

it('creates folder and validates bridge writes', async () => {
  const { query, bridge } = await setupMutation(__dirname, config);

  const result = await query({
    query: createFolderMutation,
    variables: {},
  });

  await expect(format(result)).toMatchFileSnapshot(
    'folder-creation-response.json'
  );

  const folderWrite = bridge.getWrite(
    'posts/northwind/company-updates/.gitkeep.md'
  );
  await expect(folderWrite).toBeDefined();
});

it('prevents creating duplicate folder', async () => {
  const { query } = await setupMutation(__dirname, config);

  // Create folder first time
  await query({
    query: createFolderMutation,
    variables: {},
  });

  // Try to create same folder again
  const result = await query({
    query: createFolderMutation,
    variables: {},
  });

  expect(result.errors).toBeDefined();
  expect(result.errors![0].message).toContain('already exists');
});

it('creates nested folder structure', async () => {
  const { query, bridge } = await setupMutation(__dirname, config);

  const nestedFolderMutation = `
    mutation {
      createFolder(
        collection: "post"
        relativePath: "northwind/departments/marketing/campaigns"
      ) {
        __typename
      }
    }
  `;

  await query({
    query: nestedFolderMutation,
    variables: {},
  });

  const folderWrite = bridge.getWrite(
    'posts/northwind/departments/marketing/campaigns/.gitkeep.md'
  );
  expect(folderWrite).toBeDefined();
});
